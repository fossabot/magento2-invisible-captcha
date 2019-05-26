/*
 * Copyright (c) 2019. Volodymyr Hryvinskyi.  All rights reserved.
 * @author: <mailto:volodymyr@hryvinskyi.com>
 * @github: <https://github.com/hryvinskyi>
 */

define([
    'jquery',
    'ko',
    'uiComponent',
    './model/invisible-captcha'
], function ($, ko, Component, invisibleCaptcha) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Hryvinskyi_InvisibleCaptcha/invisible-captcha',
            action: '',
            captchaId: ''
        },
        _initializedForms: [],

        /**
         * Initialization
         */
        initialize: function () {
            this._super();
            this._loadGoogleApi();
        },

        /**
         * Initialize Google ReCaptca Script
         *
         * @private
         */
        _loadGoogleApi: function () {
            var self = this;

            if (invisibleCaptcha.isApiLoad() === true) {
                $(window).trigger('recaptcha_api_ready_' + self.captchaId);
                return;
            }

            window.onloadCallbackGoogleRecapcha = function () {
                invisibleCaptcha.isApiLoaded(true);
                invisibleCaptcha.initializeForms.each(function (item) {
                    self._initializeTokenField(item.element, item.self);
                });
                $(window).trigger('recaptcha_api_ready_' + self.captchaId);
            };


            if(invisibleCaptcha.isApiLoaded() === true) {
                return;
            }

            require([
                '//www.google.com/recaptcha/api.js?onload=onloadCallbackGoogleRecapcha&render=' + self.siteKey
            ]);

            invisibleCaptcha.isApiLoad(true);
        },

        /**
         * Loads google API and triggers event, when loaded
         *
         * @private
         */
        _initializeTokenField: function (element, self) {
            if (invisibleCaptcha.initializedForms.indexOf(self.captchaId) === -1) {
                invisibleCaptcha.initializedForms.push(self.captchaId);

                var tokenField = $('<input type="hidden" name="hryvinskyi_invisible_token" />'),
                    siteKey = self.siteKey,
                    action = self.action;

                grecaptcha.ready(function () {
                    grecaptcha
                        .execute(siteKey, {action: action})
                        .then(function (token) {
                            tokenField.val(token);
                        });
                });
                tokenField.attr('data-action', action);
                $(element).append(tokenField);
            }
        },

        /**
         * Initialize recaptcha
         *
         * @param {Dom} element
         * @param {Object} self
         */
        initializeCaptcha: function (element, self) {
            if (invisibleCaptcha.isApiLoad() === true && invisibleCaptcha.isApiLoaded() !== true) {
                invisibleCaptcha.initializeForms.push({'element': element, self: self});
            } else if(invisibleCaptcha.isApiLoaded() === true) {
                self._initializeTokenField(element, self);
            } else {
                $(window).on('recaptcha_api_ready_' + self.captchaId, function () {
                    self._initializeTokenField(element, self);
                });
            }
        }
    });
});