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

const { CardFactory } = require("botbuilder");
const { DialogBot } = require("./dialogBot");
const WelcomeCard = require("./resources/welcomeCard.json");
const GraphCard = require("./resources/graphCard.json");

class DialogAndWelcomeBot extends DialogBot {
  constructor(conversationState, userState, dialog) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      GraphCard.body = [];
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await this.constructCard(membersAdded[cnt].name);
          const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
          const graphCard = CardFactory.adaptiveCard(GraphCard);
          await context.sendActivity({ attachments: [graphCard] });
          await dialog.run(
            context,
            conversationState.createProperty("DialogState")
          );
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  async constructCard(name) {
    // here we are constructing the json GraphCard to render the adaptive card - see, https://adaptivecards.io/designer/
    // order matters for styling
    GraphCard.body.push(await this.greetingSection(`Welcome ${name}`));

    GraphCard.body.push(
      await this.introductionSection(
        "My name is Abi.  Im here to assist you with Beroe intel. Check out some sample questions Ive been asked before: "
      )
    );
    GraphCard.actions = await this.actionsSection();

    // GraphCard.body.push(
    //   await this.userDataSection(
    //     name,
    //     `https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg`
    //   )
    // );
  }
  async greetingSection(greeting) {
    let outJson = {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      color: "light",
      text: `${greeting}`,
    };
    return await outJson;
  }
  async introductionSection(description) {
    let welcomCardBodyItem = {
      type: "TextBlock",
      text: `${description}`,
      wrap: true,
      color: "light",
    };

    return await welcomCardBodyItem;
  }
  async userDataSection(name, imgUrl) {
    let welcomCardBodyItem = {
      type: "ColumnSet",
      columns: [
        {
          type: "Column",
          items: [
            {
              type: "TextBlock",
              weight: "Bolder",
              text: `${name}`,
              wrap: true,
            },
            {
              type: "TextBlock",
              spacing: "None",
              text: `${new Date(Date.UTC(0, 0, 0, 0, 0, 0))}`,
              isSubtle: true,
              wrap: true,
            },
          ],
          width: "stretch",
        },
        {
          type: "Column",
          items: [
            {
              type: "Image",
              style: "Person",
              size: "Small",
              url: `${imgUrl}`,
            },
          ],
          width: "auto",
        },
      ],
    };
    return await welcomCardBodyItem;
  }
  async actionsSection() {
    const actionsJson = [
      {
        type: "Action.Submit",
        title: "What is the price of nylon in Asia from Nov 2021 to Dec 2021",
        data: "What is the price of nylon in Asia from Nov 2021 to Dec 2021",
      },
      {
        type: "Action.Submit",
        title: "Find women owned beverage can suppliers in India",
        data: "Find women owned beverage can suppliers in India",
      },
    ];
    return await actionsJson;
  }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
