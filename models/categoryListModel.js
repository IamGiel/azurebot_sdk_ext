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

class Category {
    constructor(
        Name_of_Sub_Category,
        Guidance,
        Market_Overview,
        Region,
        Actual_Period,
        Price_Point,
        Currency,
        Unit,
        Grade_ID,
        Grade,
        __typename
    ) {
        this.Name_of_Sub_Category = Name_of_Sub_Category;
        this.Guidance = Guidance;
        this.Market_Overview = Market_Overview;
        this.Region = Region;
        this.Actual_Period = Actual_Period;
        this.Price_Point = Price_Point;
        this.Currency = Currency;
        this.Unit = Unit;
        this.Grade_ID = Grade_ID;
        this.Grade = Grade;
        this.__typename = __typename;
    }
    getCategoryDetails() {
        let details = {};
        details.Name_of_Sub_Category = this.Name_of_Sub_Category;
        details.Guidance = this.Guidance;
        details.Market_Overview = this.Market_Overview;
        details.Region = this.Region;
        details.Actual_Period = this.Actual_Period;
        details.Price_Point = this.Price_Point;
        details.Currency = this.Currency;
        details.Unit = this.Unit;
        details.Grade_ID = this.Grade_ID;
        details.Grade = this.Grade;
        details.__typename = this.__typename;

        return details;
    }
}

class CategoryListModel extends Category {
    constructor(categoryDetails) {
        super(categoryDetails); // Pass licensePlateNumber up to the parent class.
        this.categoryDetails = [...categoryDetails];
    }
    getCategoryDetails() {
        return this.categoryDetails;
    }
}

module.exports.CategoryListModel = CategoryListModel;
