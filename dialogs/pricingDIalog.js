/* eslint-disable no-prototype-builtins */
/* eslint-disable camelcase */
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
const { InputHints, MessageFactory, CardFactory } = require("botbuilder");
const {
  ConfirmPrompt,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { CategoryService } = require("../services/categoryService");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const { DateResolverDialog } = require("./dateResolverDialog");
const QuickChart = require("quickchart-js");
const qc = new QuickChart();

const CONFIRM_PROMPT = "confirmPrompt";
const DATE_RESOLVER_DIALOG = "dateResolverDialog";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

const test_data = require("../bots/resources/sample_data");

class PricingDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "pricingDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          // this.destinationStep.bind(this),
          this.originStep.bind(this),
          this.dateStep.bind(this),
          this.confirmStep.bind(this),
          this.displayStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
    this.url = null;
    this.dataToGraph = null;
    this.price_details = null;
  }

  /**
   * If an origin city has not been provided, prompt for one.
   */
  async originStep(stepContext) {
    this.price_details = stepContext.options;

    const pricingDetails = stepContext.options;
    // Capture the response to the previous step's prompt

    if (!pricingDetails.region) {
      const messageText =
        "From what region are you interested in (e,g Asia, Europe, Middle East)?";
      const msg = MessageFactory.text(
        messageText,
        "From what region are you interested in (e,g Asia, Europe, Middle East)?",
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(pricingDetails.region);
  }

  /**
   * If a travel date has not been provided, prompt for one.
   * This will use the DATE_RESOLVER_DIALOG.
   */
  async dateStep(stepContext) {
    const pricingDetails = stepContext.options;

    // Capture the results of the previous step
    pricingDetails.origin = stepContext.result;
    if (!pricingDetails.priceDates) {
      return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, {
        pdate: pricingDetails.priceDates,
      });
    }
    return await stepContext.next(pricingDetails.priceDates);
  }

  /**
   * Confirm the information the user has provided.
   */
  async confirmStep(stepContext) {
    const pricingDetails = stepContext.options;
    // {
    //     region: 'Asia',
    //     priceDates: { startDate: '2021-11-01', endDate: ',2021-12-01', period: 'P1M' },
    //     categoryName: 'Nylon',
    //     origin: 'Asia'
    //   }
    // Capture the results of the previous step
    pricingDetails.priceDates = stepContext.result;

    let messageText = null;
    if (pricingDetails.priceDates.start && pricingDetails.priceDates.end) {
      messageText = `Please confirm, The category name is ${pricingDetails.categoryName} and I have you looking into: ${pricingDetails.origin} from ${pricingDetails.priceDates.start} to ${pricingDetails.priceDates.end}. Is this correct?`;
    } else {
      messageText = `Please confirm, The category name is ${pricingDetails.categoryName} and I have you looking into: ${pricingDetails.origin} on ${pricingDetails.priceDates}. Is this correct?`;
    }
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.AcceptingInput
    );

    // Offer a YES/NO prompt.
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  /**
   * Complete the interaction and end the dialog.
   */
  async displayStep(stepContext) {
    if (stepContext.result === true) {
      const pricingDetails = stepContext.options;

      // THIS IS WERE WE CALL THE SERVICE TO GET DATA
      let apicall = new CategoryService(pricingDetails);
      let reconstructedpayload = apicall.reconstructPayload(pricingDetails);
      // console.log(
      //     "reconstructed payload >>>>>>>>>>> ",
      //     reconstructedpayload
      // );

      const response = await apicall.post(reconstructedpayload);
      if (response && response.data) {
        this.dataToGraph = response.data;

        const count = await this.dataToGraph.data.categoriesv2.count;

        if (count > 0) {
          // PASS DATA TO GRAPH
          await this.getDataAndPrintGraphURL(
            this.price_details.categoryName,
            this.dataToGraph
          );
          await stepContext.context.sendActivity({
            attachments: [this.createHeroCard()],
          });
        } else if (!count || count === 0) {
          await stepContext.context.sendActivity(
            "Unfortunately, no data is available for that request."
          );
        }
      }

      // restart man\in dialog
      return stepContext.prompt(CONFIRM_PROMPT, {
        prompt: "I hope that helped.",
      });
    }
    return stepContext.beginDialog("MainDialog");
  }

  async finalStep(stepContext) {
    return stepContext.beginDialog("MainDialog");
  }

  async getDataAndPrintGraphURL(name, data) {
    console.log("dataToGraph ========================= ", data);
    const count = await data.data.categoriesv2.count;
    const categories = await data.data.categoriesv2.category;
    let res = this.createGraphData(categories);
    qc.setConfig({
      type: "bar",
      data: res.dataset,
      options: {
        responsive: true,
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Price of ${this.price_details.categoryName} in ${res.currency} per ${res.unit}`,
        },
        plugins: {
          roundedBars: true,
        },
      },
    });
    qc.setBackgroundColor("#ffff");

    // console.log(qc.getUrl());

    this.url = await qc.getShortUrl();
    console.log(this.url);
    return await this.url;
  }
  createHeroCard() {
    return CardFactory.heroCard(
      "",
      CardFactory.images([`${this.url}`]),
      CardFactory.actions([
        {
          type: "openUrl",
          title: "Learn More and Speak with a category specialist",
          value: "https://docs.microsoft.com/en-us/azure/bot-service/",
        },
      ])
    );
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }

  createGraphData(dataArray) {
    // console.log("dataArray ============== \n", dataArray);
    let newresult;
    let datasets = [];
    const tempGuidance = [];
    const tempPeriod = [];
    const fields = {};
    let arr = [];
    let name;
    let currency;
    let unit;
    let graphObj;
    let res = {};

    dataArray.forEach((k) => {
      tempGuidance.push(k.Guidance);
      tempPeriod.push(k.Actual_Period);
    });
    const uniqueGuidance = Array.from(new Set(tempGuidance));
    const uniquePeriod = Array.from(new Set(tempPeriod));

    for (let i = 0; i < uniqueGuidance.length; i++) {
      const element = uniqueGuidance[i];
      fields[uniqueGuidance[i]] = [];
    }
    dataArray.forEach((k, i) => {
      if (fields.hasOwnProperty(k.Guidance)) {
        fields[k.Guidance].push(k);
      }
    });

    for (var k in fields) {
      newresult = fields[k].map((k, i) => {
        name = k.Guidance;
        currency = k.Currency;
        unit = k.Unit;
        for (let i = 0; i < uniqueGuidance.length; i++) {
          if (k.Guidance === uniqueGuidance[i]) {
            arr.push(parseInt(k.Price_Point));
          }
        }
      });

      let outcome = {
        label: `${name}`,
        // borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        data: arr,
      };

      datasets.push(outcome);
      graphObj = {
        labels: uniquePeriod,
        datasets: datasets,
      };
      res.dataset = graphObj;
      res.catname = name;
      res.unit = unit;
      res.currency = currency;
    }
    return res;
  }
}

module.exports.PricingDialog = PricingDialog;
