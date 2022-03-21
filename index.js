/* eslint-disable no-fallthrough */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-duplicate-case */
/* eslint-disable no-unreachable */
/* eslint-disable prefer-const */
/* eslint-disable space-before-function-paren */
/* eslint-disable padded-blocks */
/* eslint-disable key-spacing */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-trailing-spaces */
/* eslint-disable space-before-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable quote-props */
/* eslint-disable template-curly-spacing */
/* eslint-disable curly */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require("path");

// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, ".env");
require("dotenv").config({ path: ENV_FILE });

const restify = require("restify");

// Import required services for bot telemetry
const {
  ApplicationInsightsTelemetryClient,
  TelemetryInitializerMiddleware,
} = require("botbuilder-applicationinsights");
const { TelemetryLoggerMiddleware } = require("botbuilder-core");

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConversationState,
  createBotFrameworkAuthenticationFromConfiguration,
  InputHints,
  MemoryStorage,
  NullTelemetryClient,
  UserState,
} = require("botbuilder");

const { LuisRecognizerClass } = require("./dialogs/LuisRecognizer");

// This bot's main dialog.
const { DialogAndWelcomeBot } = require("./bots/dialogAndWelcomeBot");
const { MainDialog } = require("./dialogs/mainDialog");

// the bot's pricing dialog
const { PricingDialog } = require("./dialogs/pricingDIalog");
const PRICING_DIALOG = "pricingDialog";

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication =
  createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  let onTurnErrorMessage = "The bot encountered an error or bug.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  onTurnErrorMessage =
    "To continue to run this bot, please fix the bot source code.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  // Clear out state
  await conversationState.delete(context);
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Add telemetry middleware to the adapter middleware pipeline
var telemetryClient = getTelemetryClient(process.env.InstrumentationKey);
var telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient);
var initializerMiddleware = new TelemetryInitializerMiddleware(
  telemetryLoggerMiddleware
);
adapter.use(initializerMiddleware);

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// If configured, pass in the LuisRecognizer.  (Defining it externally allows it to be mocked for tests)
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = {
  applicationId: LuisAppId,
  endpointKey: LuisAPIKey,
  endpoint: LuisAPIHostName,
};

const luisRecognizer = new LuisRecognizerClass(luisConfig, telemetryClient);

// Create the main dialog.
const pricingDialog = new PricingDialog(PRICING_DIALOG);
const dialog = new MainDialog(luisRecognizer, pricingDialog);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

dialog.telemetryClient = telemetryClient;

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(
    "\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator"
  );
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming activities and route them to your bot main dialog.
server.post("/api/messages", async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => bot.run(context));
});

// Enable the Application Insights middleware, which helps correlate all activity
// based on the incoming request.
server.use(restify.plugins.bodyParser());

// Creates a new TelemetryClient based on a instrumentation key
function getTelemetryClient(instrumentationKey) {
  if (instrumentationKey) {
    return new ApplicationInsightsTelemetryClient(instrumentationKey);
  }
  return new NullTelemetryClient();
}

// Listen for Upgrade requests for Streaming.
server.on("upgrade", async (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

  // Set onTurnError for the CloudAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  await streamingAdapter.process(req, socket, head, (context) =>
    bot.run(context)
  );
});
