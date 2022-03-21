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

const { LuisRecognizer } = require("botbuilder-ai");

class LuisRecognizerClass {
  constructor(config, telemetryClient) {
    const luisIsConfigured =
      config && config.applicationId && config.endpointKey && config.endpoint;
    if (luisIsConfigured) {
      // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
      // More details can be found in https://docs.microsoft.com/azure/cognitive-services/luis/luis-migration-api-v3
      const recognizerOptions = {
        apiVersion: "v3",
        telemetryClient: telemetryClient,
      };

      this.recognizer = new LuisRecognizer(config, recognizerOptions);
    }
  }

  get isConfigured() {
    return this.recognizer !== undefined;
  }

  /**
   * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
   * @param {TurnContext} context
   */
  async executeLuisQuery(context) {
    return await this.recognizer.recognize(context);
  }

  getFromEntities(result) {
    // geographyV2: [ { location: 'Asia', type: 'continent' } ],
    let fromValue;
    if (result.entities.geographyV2) {
      fromValue = result.entities.geographyV2[0].location;
    }

    return { from: fromValue, airport: "no airport for this use case" };
  }

  getCategoryName(result) {
    let name;
    // CategoryListEntity: [ [ 'Nylon' ] ],
    if (result.entities.CategoryListEntity) {
      name = result.entities.CategoryListEntity[0];
      return { categoryName: name[0] };
    } else {
      return { categoryName: undefined };
    }
  }

  /**
   * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
   * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
   */
  getPriceDates(result) {
    const datetimeEntity = result.entities.datetime;
    if (!datetimeEntity || !datetimeEntity[0]) {
      return undefined;
    }
    // [ { timex: [ '2021-11' ], type: 'daterange' } ]
    const timex = datetimeEntity[0].timex;

    const datetime = timex[0].split("T")[0];
    let first_date = datetime.slice(1, 11);
    let second_date = datetime.slice(12, 22);

    console.log("comma extra here >>>>>>>>>>>>>>>>>>>>>>> ", second_date);

    let res = {};
    // timex: '2021-11',
    // type: 'daterange',
    // start: '2021-11-01',
    // end: '2021-12-01'
    res.start = first_date;
    res.end = second_date;
    res.period = datetime.slice(23).replace(/([()])/g, "");

    console.log(
      "this is getPriceDates.  This block called when a date is provided. ",
      `${timex[0]}-02`
    );
    // here we need to reconstruct the date format 2021-11 to 2021-11-02
    // if user provides a specific day, then we pass that day, if not we default to 02
    if (res.end === "" && timex[0]) {
      let output = `${timex[0]}`;
      if (output.length === 7) {
        return `${timex[0]}-02`;
      } else {
        return output;
      }
    } else {
      console.log("this is res >>>>>>> ", res);
      return res;
    }
  }

  getDateType(result) {
    // [ { timex: [ '(2021-11-01,2021-12-01,P1M)' ], type: 'daterange' } ]
    const datetimeEntity = result.entities.datetime;
    console.log("getdatetype ?>>>> > > > > > ", datetimeEntity);
    if (!datetimeEntity || !datetimeEntity[0]) {
      return undefined;
    }
    const dateType = datetimeEntity[0].type;
    return dateType;
  }
}

module.exports.LuisRecognizerClass = LuisRecognizerClass;
