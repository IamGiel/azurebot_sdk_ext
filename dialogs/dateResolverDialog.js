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

const { InputHints, MessageFactory } = require("botbuilder");
const { DateTimePrompt, WaterfallDialog } = require("botbuilder-dialogs");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const {
    TimexProperty,
} = require("@microsoft/recognizers-text-data-types-timex-expression");

const DATETIME_PROMPT = "datetimePrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class DateResolverDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || "dateResolverDialog");
        this.addDialog(
            new DateTimePrompt(
                DATETIME_PROMPT,
                this.dateTimePromptValidator.bind(this)
            )
        ).addDialog(
            new WaterfallDialog(WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.finalStep.bind(this),
            ])
        );

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initialStep(stepContext) {
        const timex = stepContext.options.pdate;
        // console.log(
        //     "if date is prompetd in dateresolver initial step >>> ",
        //     stepContext.options
        // );

        const promptMessageText =
            "On what period are you looking into? (e.g From Nov 2021 to Dec 2021)";
        const promptMessage = MessageFactory.text(
            promptMessageText,
            promptMessageText,
            InputHints.ExpectingInput
        );

        const repromptMessageText =
            "I'm sorry, for best results, please enter date including the month, day and year.";
        const repromptMessage = MessageFactory.text(
            repromptMessageText,
            repromptMessageText,
            InputHints.ExpectingInput
        );

        if (!timex) {
            // We were not given any date at all so prompt the user.
            return await stepContext.prompt(DATETIME_PROMPT, {
                prompt: promptMessage,
                retryPrompt: repromptMessage,
            });
        }
        return await stepContext.next(timex);
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog(stepContext.result[0]);
    }

    async dateTimePromptValidator(promptContext) {
        console.log("dateTimeValidator >>>>>>>>>>>>>> ", promptContext);
        if (promptContext.recognized.succeeded) {
            // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
            // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
            const timex = promptContext.recognized.value;
            console.log(
                "timex >>>>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>>>>>> ",
                timex
            );

            // if theres a end date
            // If this is a definite Date including year, month and day we are good otherwise reprompt.
            // A better solution might be to let the user know what part is actually missing.
            return await timex;
        }
        return false;
    }
}

module.exports.DateResolverDialog = DateResolverDialog;
