var bitcoin = angular.module('bitcoin', []);

bitcoin.controller('bitcoinController',bitcoinController);

function bitcoinController(){
	var vm = this;
	initWithDemo();
	vm.getInitialTHSPower = getInitialTHSPower;
	vm.calculatedBitcoinResults = calculatedBitcoinResults();
	vm.getMiningableBTC = getMiningableBTC(vm.calculatedBitcoinResults);
	vm.recalculate = recalculate;
	vm.expectedValueOfOwnBTC = expectedValueOfOwnBTC();
	
	function initWithDemo(){
		vm.investment = 1000;
		vm.priceOfTHS = 150;
		vm.priceOfFeeForTHSPerDay = 0.35;
		vm.priceOfBTC = 17700;
		vm.daysBetweenDifficultyChange = 14;
		vm.difficultyFactor = 0.9;
		vm.BTCperDayWithOneTHSWithStartDifficulty = 0.0001581;
		vm.maximumTHS = 100;
		vm.lengthOfContractInDays = 365;
		vm.expectedPriceOfBTCInTheFuture = 30000;
	}


	function getInitialTHSPower(){
		return vm.investment / vm.priceOfTHS;
	}
	
	function calculatedBitcoinResults(){
		var dailyResults = [];
		
		dailyResults.push(getFirstDayResult());
		
		for(var i = 1; i < vm.lengthOfContractInDays + 1; ++i){
			
			var result = {
				BTCWithThisPowerForTheRestOfTheYear: getBTCWithPreviousDayPowerForTheRestOfTheYear(dailyResults,i),
				numberOfDay: i,
				dailyFee: getDailyFee(dailyResults,i),
				dailyPower: getNewDailyPower(dailyResults,i),
				dailyBTC: getDailyBTC(dailyResults,i)
			};
			
			dailyResults.push(result);
			
		}
		
		return dailyResults;
	}
	
	function getFirstDayResult(){
		 var firstDay = {
			BTCWithThisPowerForTheRestOfTheYear: 0,
			numberOfDay: 0,
			dailyFee: getInitialTHSPower() * vm.priceOfFeeForTHSPerDay,
			dailyPower: getInitialTHSPower(),
			dailyBTC: 0
		 }
		 return firstDay;
	}
	
	function getDailyFee(dailyResults,numberOfActualDay){
		return dailyResults[numberOfActualDay - 1].dailyPower * vm.priceOfFeeForTHSPerDay
	}
	
	function getNewDailyPower(dailyResults,numberOfActualDay){
		var previousDay = dailyResults[numberOfActualDay - 1];
		var newDailyPower = previousDay.dailyPower + previousDay.dailyBTC * vm.priceOfBTC / vm.priceOfTHS;
		return newDailyPower > vm.maximumTHS ? vm.maximumTHS : newDailyPower;
	}
	
	function getDailyBTC(dailyResults,numberOfActualDay){
		var previousDay = dailyResults[numberOfActualDay - 1];
		return vm.BTCperDayWithOneTHSWithStartDifficulty * difficultyFactor(numberOfActualDay) * previousDay.dailyPower - previousDay.dailyFee / vm.priceOfBTC;
	}
	
	function getBTCWithPreviousDayPowerForTheRestOfTheYear(dailyResults,numberOfActualDay){
		var remainingDays = vm.lengthOfContractInDays - numberOfActualDay;
		var previousDay = dailyResults[numberOfActualDay - 1];
		
		var miningableBTC = 0;
		for(var i = numberOfActualDay ; i < vm.lengthOfContractInDays ; ++i) {
			miningableBTC += vm.BTCperDayWithOneTHSWithStartDifficulty * difficultyFactor(i) * previousDay.dailyPower - previousDay.dailyFee / vm.priceOfBTC;
		}
		return miningableBTC;
	}
	
	function getMiningableBTC(calculatedBitcoinResults){
		var bestDay = calculatedBitcoinResults[0];
		for(var i = 1; i < calculatedBitcoinResults.length; ++i){
			if(calculatedBitcoinResults[i].BTCWithThisPowerForTheRestOfTheYear > bestDay.BTCWithThisPowerForTheRestOfTheYear){
				bestDay = calculatedBitcoinResults[i];
			}
		}
		return bestDay;
	}
	
	function difficultyFactor(numberOfActualDay){
		return Math.pow(vm.difficultyFactor,Math.trunc(numberOfActualDay / vm.daysBetweenDifficultyChange));
	}
	
	function recalculate(){
		vm.calculatedBitcoinResults = calculatedBitcoinResults();
		vm.getMiningableBTC = getMiningableBTC(vm.calculatedBitcoinResults);
		vm.expectedValueOfOwnBTC = expectedValueOfOwnBTC();
	}
	
	function expectedValueOfOwnBTC(){
		return vm.expectedPriceOfBTCInTheFuture * vm.getMiningableBTC.BTCWithThisPowerForTheRestOfTheYear;
	}
}

