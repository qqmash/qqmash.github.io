var CONFIGS = {
    defaultCountdownTime: 60,
    getBillCountdownTime: 100,
    loginReloadTime: 5,
    inspectorIntervalTime: 30,
    keyboardMaxInputSize: 45,
    communalChangeEnabledOperators: ['MegaCom', 'Beeline', 'Nurtelecom'],
    communalChangeMinSum: 50,
    maxPayment: 30000,
    energosbytPeniMaxPayment: 50
};

var PageHistory = {
    history: [],
    needToPush: true,
    needToPaginate: true,
    push: function(page){
        if(this.needToPush){
            this.history.push(page);
        }
        this.needToPush = true;
    },
    back: function(){
        this.history.pop();
        var command = this.history[this.history.length - 1];
        if(command){
            this.needToPush = false;
            if(/Paginator\.setCurrentPage\(\d+\)/.test(command)){
                this.needToPaginate = false;
            }
            eval(command);
        }else{
            Page.loadMainPage();
        }
    },
    reset: function(){
        this.history = [];
    },
    setPage: function(page){
        var lastCommand = this.history[this.history.length - 1];
        if(lastCommand){
            if(/Paginator\.setCurrentPage\(\d+\)/.test(lastCommand)){
                this.history[this.history.length - 1] = lastCommand.replace(/setCurrentPage\((\d+)\)/, 'setCurrentPage('+ page + ')');
            }else{
                this.history[this.history.length - 1] += ";setTimeout(function(){Paginator.setCurrentPage(" + page + ");Paginator.paginateItems();}, 500);";
            }
        }
    }
};

var GLOBALS = {
    operator: null,
    category: '',
    currentPage: '',
    currentAmount: 0,
    currentSum: 0,
    requisite: '',
    changeSum: 0,
    changePrimaryRequisite: '',
    changePrimaryOperator: null,

    setOperator: function(operator){
        this.operator = operator;
    },
    getOperator: function(){
        return this.operator;
    },
    resetOperator: function(){
        this.operator = null;
    },

    setCurrentPage: function(page){
        this.currentPage = page;
    },
    getCurrentPage: function(){
        return this.currentPage;
    },

    setCurrentAmount: function(value) {
        this.currentAmount = parseInt(value);
    },
    getCurrentAmount: function() {
        return this.currentAmount || 0;
    },
    resetCurrentAmount: function() {
        this.currentAmount = 0;
    },

    setCurrentSum: function(value){
        this.currentSum = value;
    },
    getCurrentSum: function(){
        return this.currentSum || 0;
    },
    resetCurrentSum: function(){
        this.currentSum = 0;
    },

    setRequisite: function(value){
        this.requisite = value;
    },
    getRequisite: function(){
        return this.requisite;
    },
    resetRequisite: function(){
        this.requisite = '';
    },

    setChangeSum: function(value){
        this.changeSum = value;
    },
    getChangeSum: function(){
        return this.changeSum;
    },
    resetChangeSum: function(){
        this.changeSum = 0;
    },

    setChangePrimaryRequisite: function(value){
        this.changePrimaryRequisite = value;
    },
    getChangePrimaryRequisite: function(){
        return this.changePrimaryRequisite;
    },
    resetChangeRequite: function(){
        this.changePrimaryRequisite = '';
    },

    setCategory: function(category){
        this.category = category;
    },
    getCategory: function(){
        return this.category;
    },

    getChangePrimaryOperator: function(){
        return this.changePrimaryOperator;
    },
    setChangePrimaryOperator: function(operator){
        this.changePrimaryOperator = operator;
    }
};

var Page = {
    loading: false,
    getRequisitePageContent: '',
    isPayButtonClicked: false,
    cancelButtonInterval: null,
    nextButtonInterval: null,

    login: function(){
        var self = this;
        GLOBALS.setCurrentPage('index/login(loading)');
        var params = {
            r: 'index/login'
        };
        Helper.sendAjaxRequest(params, function(data){
            GLOBALS.setCurrentPage('index/login');
            if (data.responseText === '0') {
                Helper.changeWorkArea('<div id="error">Терминал временно<br />не работает</div>');
                setTimeout('window.location.reload(true)', CONFIGS.loginReloadTime * 1000);
            }else{
                self.loadMainPage();
            }
        });
    },

    loadMainPage: function(){
        this.isPayButtonClicked = false;
        Animations.flyOutStartPageItems('.home-page>div');
        GLOBALS.setCurrentPage('index/categories(loading)');
        GLOBALS.resetOperator();
        Helper.stopResetCountdown();
        var params = {
            r: 'index/categories'
        };

        Helper.sendAjaxRequest(params, function(data){
            $('#banner-region').fadeIn(100);
            Helper.changeWorkArea(data.responseText);
            GLOBALS.setCurrentPage('index/categories');
            Animations.flyInMainPageItems('.categories-buttons > .item');
            Inspector.start();
            PageHistory.reset();
        });
    },

    backToMainPage: function() {
        Analytics.createEvent('back_to_main');
        this.loadMainPage();
    },

    loadCategory: function(catId) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        var self = this;

        Animations.flyOutMainPageItems('.categories-buttons > .item');
        GLOBALS.setCurrentPage('category/load&catId=' + catId + '(loading)');
        Helper.stopResetCountdown();
        Inspector.stop();

        setTimeout(function() {
            var params = {
                r: 'category/load',
                catId: catId
            };
            Helper.sendAjaxRequest(params, function(data){
                $('#banner-region').fadeIn(100);
                GLOBALS.setCurrentPage('category/load&catId=' + catId);

                Helper.changeWorkArea(data.responseText);
                Animations.flyInItems('.providers-buttons > .item');
                self.loading = false;
                Helper.startResetCountdown();
                Analytics.createEvent('load_category', {'category': catId});
                PageHistory.push("Page.loadCategory('" + catId + "')");
            });
        }, Animations.animationTime);
    },
    loadSubCategory: function(subCategoryName){
        if (this.loading) {
            return;
        }
        this.loading = true;
        var self = this;
        Animations.flyOutItems('.providers-buttons > .item');
        GLOBALS.setCurrentPage('category/LoadSubCategory&catId=' + subCategoryName + '(loading)');
        Helper.stopResetCountdown();
        Inspector.stop();

        setTimeout(function() {
            var params = {
                r: 'category/LoadSubCategory',
                catId: subCategoryName
            };

            Helper.sendAjaxRequest(params, function(data){
                $('#banner-region').fadeIn(100);
                GLOBALS.setCurrentPage('category/LoadSubCategory&catId=' + subCategoryName);
                Helper.changeWorkArea(data.responseText);
                Animations.flyInItems('.providers-buttons > .item');
                Helper.startResetCountdown();
                Helper.loadingHide();
                self.loading = false;
                PageHistory.push("Page.loadSubCategory('" + subCategoryName + "')");
            });
        }, Animations.animationTime);
    },
    loadThirdLevelCategory: function(categoryName){
        if (this.loading) {
            return;
        }
        this.loading = true;
        var self = this;
        Animations.flyOutItems('.providers-buttons > .item');
        GLOBALS.setCurrentPage('category/LoadThirdLevelCategory&catId=' + categoryName + '(loading)');
        Helper.stopResetCountdown();
        Inspector.stop();

        setTimeout(function() {
            var params = {
                r: 'category/LoadThirdLevelCategory',
                catId: categoryName
            };

            Helper.sendAjaxRequest(params, function(data){
                $('#banner-region').fadeIn(100);
                GLOBALS.setCurrentPage('category/LoadThirdLevelCategory&catId=' + categoryName);
                Helper.changeWorkArea(data.responseText);
                Animations.flyInItems('.providers-buttons > .item');
                Helper.startResetCountdown();
                Helper.loadingHide();
                self.loading = false;
                PageHistory.push("Page.loadThirdLevelCategory('" + categoryName + "')");
            });
        }, Animations.animationTime);
    },
    loadProvider: function(serviceType){
        if (this.loading) {
            return;
        }
        this.loading = true;

        var self = this;

        GLOBALS.setOperator(serviceType);

        if ($('#mini-internet').html() === undefined) {
            Animations.flyOutItems('.providers-buttons > .item');
        }
        else {
            Animations.flyOutMainPageItems('.categories-buttons > .item');
        }
        GLOBALS.setCurrentPage('provider/load&serviceType=' + serviceType + '(loading)');
        Helper.stopResetCountdown();
        Inspector.stop();
        $('#banner-region').fadeOut(Animations.animationTime);
        setTimeout(function() {
            var params = {
                r: 'provider/GetRequisite',
                serviceType: serviceType
            };

            Helper.sendAjaxRequest(params, function(data){
                Helper.startResetCountdown();
                GLOBALS.setCurrentPage('provider/GetRequisite');
                Animations.slideFromRight();
                Helper.changeWorkArea(data.responseText);
                Helper.loadingHide();
                self.loading = false;

                Requisite.refresh();
                Analytics.createEvent('load_provider', {provider: GLOBALS.getOperator()});
                PageHistory.push("Page.loadProvider('" + serviceType + "')")
            });
        }, Animations.animationTime);
    },
    loadCharityProvider: function(serviceType){
        if (this.loading) {
            return;
        }
        this.loading = true;

        var self = this;

        GLOBALS.setOperator(serviceType);

        if ($('#mini-internet').html() === undefined) {
            Animations.flyOutItems('.providers-buttons > .item');
        }
        else {
            Animations.flyOutItems('.categories-buttons > .item');
        }
        GLOBALS.setCurrentPage('provider/charityPayment&serviceType=' + serviceType + '(loading)');
        Helper.stopResetCountdown();
        Inspector.stop();

        setTimeout(function() {
            $('#banner-region').fadeOut(100);
            var params = {
                r: 'provider/charityPayment',
                serviceType: serviceType
            };

            Helper.sendAjaxRequest(params, function(data){
                $('#banner-region').fadeOut(100);
                self.getMoneyPage();
                self.loading = false;
                Analytics.createEvent('load_charity_provider', {provider: GLOBALS.getOperator()});
                PageHistory.push("Page.loadCharityProvider('" + serviceType + "')")
            });
        }, Animations.animationTime);
    },
    validateRequisite: function(){

        this.getRequisitePageContent = $('#work_area').html();
        Analytics.createEvent('validate_requisite');
        Helper.stopResetCountdown();
        Helper.loadingShow();

        var requisite = Requisite.getClean(),
            url = '?r=provider/Validate&requisite=' + requisite,
            self = this;

        GLOBALS.setCurrentPage('provider/Validate&requisite=' + requisite + '(loading)');

        $.getJSON(url, {}, function(json) {
            Helper.loadingHide();
            Animations.slideFromRight();

            if (json.status === 'success') {
                Analytics.createEvent('validate_requisite_success');
                GLOBALS.setCurrentPage('provider/Validate&requisite=' + requisite);
                GLOBALS.setRequisite(requisite);
                self.checkRequisitePage(requisite, json.clientname);
            }else {
                Analytics.createEvent('validate_requisite_error', {status: json.status, requisite: requisite});
                Helper.changeWorkArea('<div class="requisite-check-container"><h1>' + json.message + '</h1></div>');
                setTimeout(
                    function(i) {
                        return function() {
                            Helper.changeWorkArea(i);
                            Analytics.createEvent('back_to_requisite_page');
                            Helper.startResetCountdown();
                            Helper.loadingHide();
                        };
                    }(self.getRequisitePageContent), 8000);
                self.getRequisitePageContent = '';
            }
        });
    },
    checkRequisitePage: function(requisite, clientName){

        GLOBALS.setCurrentPage('provider/CheckRequisite&requisite=' + requisite + '(loading)');
        this.getRequisitePageContent = $('#work_area').html();

        var params = {
            r: 'provider/CheckRequisite',
            requisite: requisite,
            clientname: clientName
        };

        Helper.sendAjaxRequest(params, function(data){
            Animations.slideFromRight();
            Helper.startResetCountdown();
            Helper.changeWorkArea(data.responseText);
            Analytics.createEvent('check_requisite_page');
        });
    },

    checkRequisitePageNext: function(){
        Analytics.createEvent('confirmed_requisite');
        Helper.stopResetCountdown();

        Animations.slideFromRight();
        this.getMoneyPage();
    },
    getMoneyPage: function(){
        GLOBALS.setCurrentPage('provider/DrawGetMoney(loading)');

        var params = {
            r: 'provider/DrawGetMoney'
        };
        var self = this;

        Helper.sendAjaxRequest(params, function(data){
            GLOBALS.setCurrentPage('provider/DrawGetMoney');
            Helper.changeWorkArea(data.responseText);
            if (GLOBALS.category === 'mobile') {
                $('#requisite').html(Requisite.format());
            }

            //var minPayment = Operators.getMinPayment(GLOBALS.getOperator());

            //if (minPayment) {
            //$('.min-payment-msg').html('Мин. сумма платежа ' + minPayment + ' сом');
            //}

            self.getBill();
        });
    },
    getMoneyPageBack: function(){
        Helper.closeCashAccepter();
        Helper.startResetCountdown();
        Helper.changeWorkArea(this.getRequisitePageContent);
        this.getRequisitePageContent = '';
        Animations.slideFromLeft();
        Analytics.createEvent('back_to_requisite_page');
    },
    getMoneyPageBackWithTimeout: function() {
        var self = this,
            time = 3500;
        if(self.cancelButtonInterval){
            return false;
        }
        $('li#cancel').addClass('timeout-3');
        self.cancelButtonInterval = setInterval(function(){
            time = time - 500;
            $('li#cancel').addClass('timeout-' + parseInt(time / 1000));
            if(time <= 0){
                clearInterval(self.cancelButtonInterval);
                self.cancelButtonInterval = null;
                var amount = GLOBALS.getCurrentAmount();
                var minPayment = parseInt($('.min-payment-msg').html().replace(/[^0-9]/g, ''));//Operators.getMinPayment(GLOBALS.getOperator());
                if(amount > 0){
                    if(minPayment){
                        if(amount >= minPayment){
                            Helper.showNextButton();
                        }
                    }else{
                        Helper.showNextButton();
                    }
                    Helper.hideCancelButton();
                }else{
                    if(Operators.getCategory() === 'charity'){
                        Helper.closeCashAccepter();
                        PageHistory.back();
//                        self.loadMainPage();
                    }else{
                        self.getMoneyPageBack();
                    }
                }
            }
        }, 500);
    },
    getMoneyPageNextWithTimeout: function(){
        var self = this,
            time = 3500;
        if(self.nextButtonInterval){
            return false;
        }
        $('li#next').addClass('timeout-3');
        self.nextButtonInterval = setInterval(function(){
            time = time - 500;
            $('li#next').addClass('timeout-' + parseInt(time / 1000));
            if(time <= 0){
                clearInterval(self.nextButtonInterval);
                self.nextButtonInterval = null;
                self.getMoneyPageNext();
            }
        }, 500);
    },
    getMoneyPageNext: function(withoutChange){
        if (
            !withoutChange
                && Operators.getCategory() === 'communal'
                && GLOBALS.getCurrentSum() >= CONFIGS.communalChangeMinSum
            ) {
            Animations.slideFromRight();
            return this.choosePaymentTypePage();
        }
        Analytics.createEvent('make_payment_start', {sum: GLOBALS.getCurrentSum()});
        this.isPayButtonClicked = true;
        GLOBALS.resetCurrentAmount();
        GLOBALS.resetCurrentSum();
        GLOBALS.resetChangeSum();
        Helper.loadingShow();
        Helper.closeCashAccepter();
        GLOBALS.setCurrentPage('provider/MakePayment(loading)')
        Animations.slideFromRight();
        Helper.stopResetCountdown();

        var params = {
            r: 'provider/MakePayment'
        };
        Helper.sendAjaxRequest(params, function(data){
            Analytics.createEvent('payment_complated');
            Helper.changeWorkArea(data.responseText);
            GLOBALS.setCurrentPage('provider/MakePayment');
            Helper.loadingHide();
            Helper.startResetCountdown(3);
        });
    },

    choosePaymentTypePage: function() {
        Helper.closeCashAccepter();
        Analytics.createEvent('choose_payment_type_page');
        GLOBALS.setCurrentPage('change/ChoosePaymentType(loading)');
        Helper.stopResetCountdown();

        var params = {
            r: 'change/ChoosePaymentType'
        };
        Helper.sendAjaxRequest(params, function(data){
            Helper.changeWorkArea(data.responseText);
            GLOBALS.setCurrentPage('change/ChoosePaymentType');
            Helper.startResetCountdown();
        });
    },
    backToChoosePaymentTypePage: function(){
        Analytics.createEvent('choose_payment_type_page');
        Animations.slideFromLeft();
        this.choosePaymentTypePage();
    },
    payWithoutChange: function(){
        Analytics.createEvent('pay_without_change');
        this.getMoneyPageNext(true);
    },
    payWithChange: function(){
        GLOBALS.setChangePrimaryOperator(GLOBALS.getOperator()); //Remember primary operator
        Analytics.createEvent('pay_with_change');
        Animations.slideFromRight();
        this.chooseAmountPage();
    },
    chooseAmountPage: function(){
        Analytics.createEvent('choose_amount_page');
        GLOBALS.setCurrentPage('change/ChooseAmount(loading)');
        Helper.stopResetCountdown();
        var params = {
            r: 'change/ChooseAmount'
        };
        Helper.sendAjaxRequest(params, function(data){
            Helper.changeWorkArea(data.responseText);
            Helper.sumChanged();
            GLOBALS.setCurrentPage('change/ChooseAmount');
            Helper.startResetCountdown();
            var minPayment = Operators.getMinPayment(GLOBALS.getOperator());

            if (minPayment) {
                $('.min-payment-msg').html('Мин. сумма платежа ' + minPayment + ' сом');
            }
        });
    },
    chooseAmountPageNext: function(){
        Helper.loadingShow();
        GLOBALS.setCurrentPage('change/MakePrimaryPayment(loading)');

        var amount = parseInt(Requisite.getClean()),
            currentSum = parseInt(GLOBALS.getCurrentSum()),
            commision = parseInt($('#comission').text());

        GLOBALS.setChangeSum(currentSum - (amount + commision));
        GLOBALS.resetCurrentAmount();
        GLOBALS.resetCurrentSum();

        Analytics.createEvent('change_make_primary_payment', {amount: amount});

        var params = {
            r: 'change/MakePrimaryPayment',
            amount: amount
        };
        Helper.sendAjaxRequest(params, function(data){
            Helper.loadingHide();
            Animations.slideFromRight();
            Analytics.createEvent('change_make_primary_payment_complated');
            Helper.changeWorkArea(data.responseText);
            GLOBALS.setChangePrimaryOperator(GLOBALS.getOperator());
            GLOBALS.setChangePrimaryRequisite(GLOBALS.getRequisite());
            Helper.selectChangeProvider('UmaiWallet');
            GLOBALS.setCurrentPage('change/MakePrimaryPayment');
        });
    },
    checkChangeRequisitePage: function(){
        var requisite = Requisite.getFromHtml();
        if (!Requisite.checkSanity(requisite)){
            return;
        }
        GLOBALS.setCurrentPage('change/CheckRequisite&requisite=' + requisite + '(loading)');
        this.getRequisitePageContent = $('#work_area').html();

        var params = {
            r: 'change/CheckRequisite',
            requisite: requisite
        };

        Helper.sendAjaxRequest(params, function(data){
            Animations.slideFromRight();
            Helper.startResetCountdown();
            Helper.changeWorkArea(data.responseText);
            Analytics.createEvent('change_check_requisite_page');
        });
    },
    checkChangeRequisitePageBack: function(){
        Helper.startResetCountdown();
        Helper.changeWorkArea(this.getRequisitePageContent);
        this.getRequisitePageContent = '';
        Animations.slideFromLeft();
        Analytics.createEvent('back_to_change_requisite_page');
    },
    checkChangeRequisitePageNext: function(){
        Analytics.createEvent('confirmed_change_requisite');

        GLOBALS.resetCurrentAmount();
        GLOBALS.resetCurrentSum();
        GLOBALS.resetChangeSum();
        Helper.stopResetCountdown();
        Helper.loadingShow();

        var requisite = Requisite.getClean(),
            provider = GLOBALS.getOperator(),
            url = '?r=change/MakePayment&requisite=' + requisite + '&provider=' + provider,
            self = this;

        GLOBALS.setCurrentPage('change/Validate&requisite=' + requisite + '&provider='+provider+'(loading)');

        $.getJSON(url, {}, function(json) {
            Helper.loadingHide();
            Animations.slideFromRight();

            if (json.status === 'success') {
                Analytics.createEvent('change_make_payment_success');
                Helper.changeWorkArea(json.message);
                GLOBALS.setCurrentPage('change/Validate&requisite=' + requisite + '&provider='+provider);
                Helper.startResetCountdown(3);
            }else {
                Analytics.createEvent('validate_change_requisite_error', {status: json.status, requisite: requisite});
                Helper.changeWorkArea('<div class="requisite-check-container"><h1>' + json.message + '</h1></div>');
                setTimeout(
                    function(i) {
                        return function() {
                            Helper.changeWorkArea(i);
                            Analytics.createEvent('back_to_change_requisite_page');
                            Helper.startResetCountdown();
                            Helper.loadingHide();
                        };
                    }(self.getRequisitePageContent), 3000);
                self.getRequisitePageContent = '';
            }
        });
    },

    getBill: function(){
        Analytics.createEvent('get_bill_start');
        Helper.startResetCountdown(CONFIGS.getBillCountdownTime);
        GLOBALS.setCurrentPage('provider/StartGetMoney(loading)');

        var intervalID,
            amountSpan = $("#amount"),
            sumSpan = $("#summ"),
            comissionSpan = $("#comission"),
//            minPayment = Operators.getMinPayment(GLOBALS.getOperator());
            minPayment = parseInt($('.min-payment-msg').html().replace(/[^0-9]/g, ''));
        self = this;

        if (amountSpan.html() < 1) {
            Helper.hideNextButton();
        }else {
            Helper.hideCancelButton();
        }

        var startGetBillAjax = new XMLHttpRequest();
        startGetBillAjax.open("GET", '?r=provider/StartGetMoney', true);
        startGetBillAjax.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
        startGetBillAjax.onreadystatechange = function() {

            Helper.startResetCountdown(CONFIGS.getBillCountdownTime);
            GLOBALS.setCurrentPage('provider/StartGetMoney');

            if (startGetBillAjax.readyState == 4) {
                clearInterval(intervalID);
                intervalID = false;
            }else if (startGetBillAjax.readyState == 3) {
                if (!intervalID) {
                    intervalID = setInterval(function() {
                        var response = startGetBillAjax.responseText;
                        var data = response.split('-');
                        var elements = data.pop();
                        var pieces = elements.split('*');

                        var amount = pieces.pop(),
                            commission = pieces.pop(),
                            sum = pieces.pop();

                        if (self.isPayButtonClicked === false) {
                            var oldSum = GLOBALS.getCurrentSum();
                            if(parseInt(sum) > parseInt(oldSum)){
                                Helper.addMoneyImage(sum - oldSum);
                            }
                            GLOBALS.setCurrentAmount(amount);
                            GLOBALS.setCurrentSum(sum);
                        }

                        sumSpan.html(sum);
                        commission += commission.indexOf('%') >= 0 ? '' : ' сом';
                        comissionSpan.html(commission);
                        amountSpan.html(amount);

                        if(amount > 0){
                            if(minPayment){
                                if(amount >= minPayment){
                                    Helper.showNextButton();
                                }
                            }else{
                                Helper.showNextButton();
                            }
                            Helper.hideCancelButton();
                            if(sum >= Operators.getMaxPayment()){
                                Helper.closeCashAccepter();
                            }
                        }
                    }, 300);
                }
            }
        };
        // Передать запрос
        startGetBillAjax.send(null);
    },
    showUmaiWalletInfo: function(){
        $('#banner-region').fadeOut(parseInt(Animations.animationTime / 2));
        GLOBALS.setCurrentPage('index/WalletInfo(loading)');

        var params = {
            r: 'index/WalletInfo'
        };

        Helper.sendAjaxRequest(params, function(data){
            GLOBALS.setCurrentPage('index/WalletInfo');
            Animations.slideFromRight();
            Helper.startResetCountdown(90);
            Helper.changeWorkArea(data.responseText);
            Analytics.createEvent('umai_wallet_info_page');
        });
    }

};


var Inspector = {
    interval: null,

    inspection: function(){
        var self = this;
        var params = {
            r: 'index/Inspection'
        };

        $.getJSON('/', params, function(json) {
            if (json.hasUpdate === '1') {
                self.showUpdatingProgress();
            }
            else if (json.onMaintenance === '1') {
                self.showOnMaintenance();
            }
            else {
                self.offInspection();
            }
        });
    },

    showUpdatingProgress: function(){
        Helper.loadingShow();
        $('#loading > p').text('Пожалуйста, подождите');
        $('#loading > h1').html('Идет обновление терминала.<br />' +
            '<span style="font-size: medium;">Приносим свои извинения за предоставленные неудобства<br />' +
            'Служба поддержки клиентов: 0552 110022, 0701 109009, 0770 309200</span>');
        this.setReadyToUpdate(1);
    },

    showOnMaintenance: function(){
        Helper.loadingShow();
        $('#loading > p').text('Пожалуйста, подождите');
        $('#loading > h1').html('Ведутся технические работы<br />' +
            '<span style="font-size: medium;">Приносим свои извинения за предоставленные неудобства<br />' +
            'Служба поддержки клиентов: 0552 110022, 0701 109009, 0770 309200</span>');
    },

    offInspection: function(){
        Helper.loadingHide();
        $('#loading > p').text('Соединение с сервером');
        $('#loading > h1').text('Пожалуйста, подождите');
        this.setReadyToUpdate(0);
    },

    start: function(){
        var self = this;
        self.stop();
        this.interval = setInterval(function() {
            self.inspection();
        },CONFIGS.inspectorIntervalTime * 1000);
    },

    stop: function(){
        clearInterval(this.interval);
        this.interval = null;
    },

    setReadyToUpdate: function(readyState){
        var self = this;
        var params = {
            r: 'index/ReadyToUpdate',
            value: (readyState)
        };
        Helper.sendAjaxRequest(params);
    }

};




