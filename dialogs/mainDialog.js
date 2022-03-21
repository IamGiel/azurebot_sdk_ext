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

const {
  TimexProperty,
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const { MessageFactory, InputHints } = require("botbuilder");
const { LuisRecognizer, QnAMaker } = require("botbuilder-ai");
const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const moment = require("moment-timezone");

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

class MainDialog extends ComponentDialog {
  constructor(luisRecognizer, pricingDialog) {
    super("MainDialog");

    if (!luisRecognizer)
      throw new Error(
        "[MainDialog]: Missing parameter 'luisRecognizer' is required"
      );
    this.luisRecognizer = luisRecognizer;

    if (!pricingDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'pricingDialog' is required"
      );

    // Define the main dialog and its related components.
    // This is a sample "book a flight" dialog.
    this.addDialog(new TextPrompt("TextPrompt"))
      .addDialog(pricingDialog)
      .addDialog(
        new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
          this.introStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */
  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  /**
   * First step in the waterfall dialog. Prompts the user for a command.
   * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
   * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
   */
  async introStep(stepContext) {
    console.log("introStep in mainDialog");
    if (!this.luisRecognizer.isConfigured) {
      const messageText =
        "NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.";
      await stepContext.context.sendActivity(
        messageText,
        null,
        InputHints.IgnoringInput
      );
      return await stepContext.next();
    }
    const messageText = stepContext.options.restartMsg
      ? stepContext.options.restartMsg
      : `What can I help you with today?`;
    const promptMessage = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepContext.prompt("TextPrompt", {
      prompt: promptMessage,
    });
  }

  /**
   * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
   * Then, it hands off to the pricingDialog child dialog to collect any remaining details.
   */
  async actStep(stepContext) {
    console.log(
      "ACT STEP IN MAIN DIALOG =============  ",
      await stepContext.context._activity
    );
    const pricingDetails = {};
    pricingDetails.adaptiveCardQuery = await stepContext.context._activity;

    if (!this.luisRecognizer.isConfigured) {
      // LUIS is not configured, we just run the pricingDialog path.
      return await stepContext.beginDialog("pricingDialog", pricingDetails);
    }

    // Call LUIS and gather any potential pricing details. (Note the TurnContext has the response to the prompt)
    const luisResult = await this.luisRecognizer.executeLuisQuery(
      stepContext.context
    );
    console.log("luis result ", luisResult);
    // =========== dispatch to the correct dialog per intent triggered ==========
    switch (LuisRecognizer.topIntent(luisResult)) {
      case "skillPriceCost": {
        // Extract the values for the composite entities from the LUIS result.
        const category = this.luisRecognizer.getCategoryName(luisResult);
        const fromEntities = this.luisRecognizer.getFromEntities(luisResult);

        // Show a warning for Origin and Destination if we can't resolve them.
        await this.showWarningForUnsupportedCities(
          stepContext.context,
          fromEntities
          // toEntities
        );

        // Initialize pricingDetails with any entities we may have found in the response.
        pricingDetails.region = fromEntities.from;
        pricingDetails.priceDates =
          this.luisRecognizer.getPriceDates(luisResult);
        pricingDetails.categoryName = category.categoryName;
        pricingDetails.datetype = this.luisRecognizer.getDateType(luisResult);

        console.log(
          "when date not prvided this is the pricing details from main dialog ",
          pricingDetails
        );

        // Run the pricingDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
        return await stepContext.beginDialog("pricingDialog", pricingDetails);
      }

      case "skillSupplierLookUp": {
        let messageText =
          "Im working on this dialog flow.  Try this query again in the near future!";
        await stepContext.context.sendActivity(
          messageText,
          messageText,
          InputHints.IgnoringInput
        );
        // stepContext.next();
        break;
      }

      case "GetWeather": {
        // We haven't implemented the GetWeatherDialog so we just display a TODO message.
        const getWeatherMessageText = "TODO: get weather flow here";
        await stepContext.context.sendActivity(
          getWeatherMessageText,
          getWeatherMessageText,
          InputHints.IgnoringInput
        );
        break;
      }

      default: {
        // QNA MAKER FOR ALL UNHANDLED QUERIES
        // this.qnaMaker = new QnAMaker({
        //   knowledgeBaseId: process.env.QnAKnowledgebaseId,
        //   endpointKey: process.env.QnAEndpointKey,
        //   host: process.env.QnAEndpointHostName,
        // });
        // console.log(
        //   "=============== this qnaMaker ==========\n",
        //   this.qnaMaker
        // );
        // if (this.qnaMaker) {
        //   const qnaResults = await this.qnaMaker.getAnswers(
        //     stepContext.context
        //   );
        //   // If an answer was received from QnA Maker, send the answer back to the user.
        //   if (qnaResults[0]) {
        //     console.log("qna maker ============ ", qnaResults);
        //     await stepContext.context.sendActivity(qnaResults[0].answer);

        //     // If no answers were returned from QnA Maker, reply with help.
        //   } else {
        //     await stepContext.context.sendActivity(
        //       "No QnA Maker answers were found."
        //     );
        //   }
        // } else {
        //   await stepContext.context.sendActivity(
        //     "No QnA Maker answers were found."
        //   );
        // }

        // Catch all for unhandled intents
        const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${LuisRecognizer.topIntent(
          luisResult
        )})`;
        await stepContext.context.sendActivity(
          didntUnderstandMessageText,
          didntUnderstandMessageText,
          InputHints.IgnoringInput
        );
      }
    }

    return await stepContext.next();
  }

  /**
   * Shows a warning if the requested From or To cities are recognized as entities but they are not in the Airport entity list.
   * In some cases LUIS will recognize the From and To composite entities as a valid cities but the From and To Airport values
   * will be empty if those entity values can't be mapped to a canonical item in the Airport.
   */
  async showWarningForUnsupportedCities(context, fromEntities, toEntities) {
    const unsupportedCities = [];
    if (fromEntities.from && !fromEntities.airport) {
      unsupportedCities.push(fromEntities.from);
    }

    // if (toEntities.to && !toEntities.airport) {
    //     unsupportedCities.push(toEntities.to);
    // }

    if (unsupportedCities.length) {
      const messageText = `Sorry but the following airports are not supported: ${unsupportedCities.join(
        ", "
      )}`;
      await context.sendActivity(
        messageText,
        messageText,
        InputHints.IgnoringInput
      );
    }
  }

  /**
   * This is the final step in the main waterfall dialog.
   * It wraps up the sample "book a flight" interaction with a simple confirmation.
   */
  async finalStep(stepContext) {
    // If the child dialog ("pricingDialog") was cancelled or the user failed to confirm, the Result here will be null.

    const result = stepContext.result;
    // if (result) {
    //   // Now we have all the booking details.

    //   // This is where calls to the booking AOU service or database would go.

    //   // If the call to the booking service was successful tell the user.
    //   const timeProperty = new TimexProperty(result.travelDate);
    //   const travelDateMsg = timeProperty.toNaturalLanguage(
    //     new Date(Date.now())
    //   );
    //   const msg = `Ok.  I hope that helped.`;
    //   await stepContext.context.sendActivity(
    //     msg,
    //     msg,
    //     InputHints.IgnoringInput
    //   );
    // }
    console.log("RESULT IN MAIN DIALOG ++++++++++++++++++++++ \n", result);
    // Restart the main dialog with a different message the second time around
    return await stepContext.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }
}

module.exports.MainDialog = MainDialog;
