

const getSettings = (roundSettings, payoutSettings) => {
	const obj = {}

	obj.contractsDisabled = roundSettings.contractsDisabled
	obj.tokensNeededToBuyTickets = parseInt(roundSettings.tokensNeededToBuyTickets) / 1e18
	obj.gameFeePotPercent = parseInt(roundSettings.gameFeePotPercent)
	obj.gameFeesBuyTokensForPotPercent = parseInt(roundSettings.gameFeesBuyTokensForPotPercent)
	obj.gameFeeDividendsPercent = parseInt(roundSettings.gameFeeDividendsPercent)
	obj.roundLengthBlocks = parseInt(roundSettings.roundLengthBlocks)
	obj.blocksAddedPer100TicketsBought = parseInt(roundSettings.blocksAddedPer100TicketsBought)
	obj.initialTicketPrice = parseInt(roundSettings.initialTicketPrice) / 1e18
	obj.ticketPriceIncreasePerBlock = parseInt(roundSettings.ticketPriceIncreasePerBlock) / 1e18
	obj.gameCooldownBlocks = parseInt(roundSettings.gameCooldownBlocks)
	obj.userBonusDivisor = parseInt(roundSettings.userBonusDivisor)
	obj.ticketPriceRoundPotDivisor = parseInt(roundSettings.ticketPriceRoundPotDivisor)

	obj.roundPotPercent = parseInt(payoutSettings.roundPotPercent)
	obj.lastBuyerPayoutPercent = parseInt(payoutSettings.lastBuyerPayoutPercent)

	obj.placePayoutPercents = []

	for(let i = 0; i < payoutSettings.placePayoutPercents.length; i++) {
		const val = parseInt(payoutSettings.placePayoutPercents[i])

		if(val === 0) {
			break
		}

		obj.placePayoutPercents.push(val)
	}

	obj.smallHolderLotteryPayoutPercent = parseInt(payoutSettings.smallHolderLotteryPayoutPercent)
	obj.largeHolderLotteryPayoutPercent = parseInt(payoutSettings.largeHolderLotteryPayoutPercent)
	obj.hugeHolderLotteryPayoutPercent = parseInt(payoutSettings.hugeHolderLotteryPayoutPercent)
	obj.smallHolderLotteryPayoutCount = parseInt(payoutSettings.smallHolderLotteryPayoutCount)
	obj.largeHolderLotteryPayoutCount = parseInt(payoutSettings.largeHolderLotteryPayoutCount)
	obj.hugeHolderLotteryPayoutCount = parseInt(payoutSettings.hugeHolderLotteryPayoutCount)
	obj.marketingPayoutPercent = parseInt(payoutSettings.marketingPayoutPercent)

	return obj
}

class Settings {
	constructor(data) {
		this.contractSettings = getSettings(data[0], data[1])
		this.currentRoundSettings = getSettings(data[2], data[3])
		this.currentRoundAddress = data[4]
	}

	get activeSettings() {
		return this.currentRoundSettings ? this.currentRoundSettings : this.contractSettings
	}

	getContractPotPercent() {
		return this.contractSettings.roundPotPercent
	}

	// calculateCurrentTicketPrice(stats) {
	// 	const settings = this.activeSettings
		
	// 	let initialPrice = settings.initialTicketPrice

	// 	if(stats.blocksElapsed === 0) {
	// 		return initialPrice
	// 	}

	// 	const timeElapsed = Math.floor(Date.now() / 1000) - stats.currentBlockTimestamp
	// 	const moreBlocksElapsed = Math.ceil(timeElapsed / 3)

	// 	initialPrice += settings.ticketPriceIncreasePerBlock * (stats.blocksElapsed + moreBlocksElapsed)

	// 	return parseFloat(initialPrice.toPrecision(6))
	// }

	calculateCurrentTicketPrice(stats) {
		const settings = this.activeSettings

		if(settings.ticketPriceRoundPotDivisor > 0) {

			return ((stats.currentRoundPot**0.75)/settings.ticketPriceRoundPotDivisor).toPrecision(6)

		 } else {

			let initialPrice = settings.initialTicketPrice
	
			if(stats.blocksElapsed === 0) {
				return initialPrice
			}
	
			const timeElapsed = Math.floor(Date.now() / 1000) - stats.currentBlockTimestamp
			const moreBlocksElapsed = Math.ceil(timeElapsed / 3)
	
			initialPrice += settings.ticketPriceIncreasePerBlock * (stats.blocksElapsed + moreBlocksElapsed)
	
			return parseFloat(initialPrice.toPrecision(6))

		 }
	}

	// calculateCurrentTicketPriceAfterNBlocks(stats, blocks) {
	// 	const settings = this.activeSettings
		
	// 	let initialPrice = settings.initialTicketPrice

	// 	if(stats.blocksElapsed === 0) {
	// 		return initialPrice
	// 	}

	// 	const timeElapsed = Math.floor(Date.now() / 1000) - stats.currentBlockTimestamp
	// 	const moreBlocksElapsed = Math.ceil((timeElapsed / 3)+blocks)

	// 	initialPrice += settings.ticketPriceIncreasePerBlock * (stats.blocksElapsed + moreBlocksElapsed)

	// 	return parseFloat(initialPrice.toPrecision(6))
	// }
}

export default Settings
