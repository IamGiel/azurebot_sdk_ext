/* eslint-disable no-useless-constructor */
/* eslint-disable no-tabs */
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

var axios = require("axios");

class CategoryService {
    constructor(payload) {
        // console.log("PAYLOAD HERE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> \n ", payload);
    }

    post(reconstructedPayload) {
        // console.log(
        //     "POST METHOD IN THE SERVICE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",
        //     reconstructedPayload
        // );

        let config = {
            method: "post",
            url: "http://angular-deployment-1.herokuapp.com/graphql",
            headers: {
                "Content-Type": "application/json",
            },
            data: reconstructedPayload,
        };
        return axios(config);
    }

    reconstructPayload(payload) {
        console.log("START RECONSTRUCT PAYLOAD");
        console.log(payload);
        let data = {};
        if (
            payload.datetype === "daterange" ||
            payload.priceDates.type === "daterange"
        ) {
            data = JSON.stringify({
                operationName: "DateRange",
                variables: {
                    offset: 0,
                    limit: 3237,
                    name: `${payload.categoryName}`,
                    region: `${payload.region}`,
                    daterange:
                        '{"start":"' +
                        `${payload.priceDates.start}T00:00:00.000Z` +
                        '","end":"' +
                        `${payload.priceDates.end}T00:00:00.000Z` +
                        '"}',
                },
                query: "query DateRange($offset: Int, $limit: Int, $name: String, $region: String, $daterange: String) {\n  categoriesv2(\n    offset: $offset\n    limit: $limit\n    name: $name\n    region: $region\n    daterange: $daterange\n  ) {\n    count\n    category {\n      Name_of_Sub_Category\n      Guidance\n      Market_Overview\n      Region\n      Actual_Period\n      Price_Point\n      Currency\n      Unit\n      Grade_ID\n      Grade\n      __typename\n    }\n    __typename\n  }\n}\n",
            });
        }

        return data;
        // {    2021-12-02T00:00:00.000Z
        //     region: 'Asia',
        //     priceDates: { start: '2021-11-01', end: '2021-12-01', period: 'P1M' },
        //     categoryName: 'Nylon',
        //     datetype: 'daterange',
        //     origin: 'Asia'
        //   }
    }
}

module.exports.CategoryService = CategoryService;
