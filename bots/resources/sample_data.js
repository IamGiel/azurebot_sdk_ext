/* eslint-disable no-array-constructor */
/* eslint-disable one-var */
/* eslint-disable template-curly-spacing */
/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const data = {
    categoriesv2: {
        count: 6,
        category: [
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "China Domestic, Spot Prices",
                Region: "Asia",
                Actual_Period: "Nov-21",
                Price_Point: "2655.52",
                Currency: "USD",
                Unit: "MT",
                Grade_ID: "D016-01",
                Grade: "Nylon 6",
                __typename: "Category",
            },
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "China Domestic, Spot Prices",
                Region: "Asia",
                Actual_Period: "Dec-21",
                Price_Point: "2469.64",
                Currency: "USD",
                Unit: "MT",
                Grade_ID: "D016-01",
                Grade: "Nylon 6",
                __typename: "Category",
            },
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "PA 6 Natural, Spot Prices",
                Region: "Europe",
                Actual_Period: "Nov-21",
                Price_Point: "3931.05",
                Currency: "EUR",
                Unit: "MT",
                Grade_ID: "D016-01",
                Grade: "Nylon 6",
                __typename: "Category",
            },
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "PA 6 Natural, Spot Prices",
                Region: "Europe",
                Actual_Period: "Dec-21",
                Price_Point: "3695.18",
                Currency: "EUR",
                Unit: "MT",
                Grade_ID: "D016-01",
                Grade: "Nylon 6",
                __typename: "Category",
            },
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "PA 66 Natural, Spot Prices",
                Region: "Europe",
                Actual_Period: "Nov-21",
                Price_Point: "6071.3",
                Currency: "EUR",
                Unit: "MT",
                Grade_ID: "D016-02",
                Grade: "Nylon 66",
                __typename: "Category",
            },
            {
                Name_of_Sub_Category: "Nylon",
                Guidance: "PA 66 Natural, Spot Prices",
                Region: "Europe",
                Actual_Period: "Dec-21",
                Price_Point: "5646.31",
                Currency: "EUR",
                Unit: "MT",
                Grade_ID: "D016-02",
                Grade: "Nylon 66",
                __typename: "Category",
            },
        ],
        __typename: "CategoryResult",
    },
};

// const tempGuidance = [];
// const tempPeriod = [];
// data.categoriesv2.category.forEach((k) => {
//     tempGuidance.push(k.Guidance);
//     tempPeriod.push(k.Actual_Period);
// });

// const uniqueGuidance = Array.from(new Set(tempGuidance));
// const uniquePeriod = Array.from(new Set(tempPeriod));
// console.log(uniqueGuidance);
// const fields = {};

// // iterate through array,
// // each array becomes an array
// for (let i = 0; i < uniqueGuidance.length; i++) {
//     const element = uniqueGuidance[i];
//     fields[uniqueGuidance[i]] = [];
// }

// data.categoriesv2.category.forEach((k, i) => {
//     if (fields.hasOwnProperty(k.Guidance)) {
//         fields[k.Guidance].push(k);
//         // console.log(fields[k.Guidance]);
//     }
// });

// // console.log(fields);
// let newresult;
// let datasets = [];
// for (var k in fields) {
//     console.log("asdasdasdassadassdaasdas ", fields[k]);

//     let arr = [];
//     let name;
//     let currency;
//     let unit;
//     newresult = fields[k].map((k, i) => {
//         // console.log("what is k.guidace >>> ", k.Guidance);
//         // console.log("what is i >>> ", i + 1);
//         // console.log("whats fields[data] length ", fields[data].length);
//         name = k.Guidance;
//         currency = k.Currency;
//         unit = k.Unit;
//         for (let i = 0; i < uniqueGuidance.length; i++) {
//             if (k.Guidance === uniqueGuidance[i]) {
//                 arr.push(parseInt(k.Price_Point));
//             }
//         }
//     });

//     let outcome = {
//         label: `${name}`,
//         // borderColor: "rgb(54, 162, 235)",
//         borderWidth: 1,
//         data: arr,
//     };
//     datasets.push(outcome);
//     let graphObj = {
//         labels: uniquePeriod,
//         datasets: datasets,
//     };

//     console.log(JSON.stringify(graphObj));
// }

// console.log(JSON.stringify(datasets));

module.exports.data = data;
