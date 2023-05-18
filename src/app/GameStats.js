

class GameStats {
	constructor(data, userAddress, settings) {
		// user data
		this.userTicketsBought = parseInt(data.userStats[0])
		this.userTotalSpentOnTickets = parseInt(data.userStats[1]) / 1e18
		this.userLastBuyBlock = parseInt(data.userStats[2])
		this.userLastBuyTimestamp = parseInt(data.userStats[3])
		this.userAccumulativeDividend = parseInt(data.userStats[4]) / 1e18
		this.userWithdrawableDividend = parseInt(data.userStats[5]) / 1e18
		this.userBalance = parseInt(data.userStats[6]) / 1e18
		this.userBonus = parseInt(data.userStats[7]) / 1000

		// game has started
		if(data.roundStats.length) {
			this.roundNumber = parseInt(data.roundStats[0])
			this.startBlock = parseInt(data.roundStats[1])
			this.startTimestamp = parseInt(data.roundStats[2])
			this.endBlock = parseInt(data.roundStats[3])
			this.endTimestamp = parseInt(data.roundStats[4])
			this.ticketsBought = parseInt(data.roundStats[5])
			this.totalSpentOnTickets = parseInt(data.roundStats[6]) / 1e18
			this.currentRoundPot = parseInt(data.roundStats[7]) / 1e18
			this.blocksLeftAtLastBuy = parseInt(data.roundStats[8])
			this.lastBuyBlock = parseInt(data.roundStats[9])
			this.tokensBurned = parseInt(data.roundStats[10]) / 1e18
			this.currentBlockTimestamp = parseInt(data.roundStats[11])
			this.currentBlockNumber = parseInt(data.roundStats[12])
			// this.potBalance = parseInt(data.roundStats[13]) / 1e18
			// this.realRoundPot = this.potBalance*parseInt(settings.getContractPotPercent())/100

			// calculated
  			this.blocksElapsedSinceLastBuy = this.currentBlockNumber - this.lastBuyBlock
  			this.blocksLeft = this.blocksLeftAtLastBuy - this.blocksElapsedSinceLastBuy
  			this.blocksElapsed = this.startBlock > 0 ? this.currentBlockNumber - this.startBlock : 0

		} else {
			this.roundNumber = 0
		}

		this.topBuyerAddress = data.topBuyerAddress
		this.topBuyerData = data.topBuyerData
		this.userStats = data.userStats

		this.lastBuyer = data.lastBuyer
		this.lastBuyerPayout = parseInt(data.lastBuyerStats[0]) / 1e18
		this.lastBuyerBalance = (parseInt(data.lastBuyerStats[1]) / 1e18).toFixed(0)
		this.lastBuyerBonus = parseInt(data.lastBuyerStats[2]) / 10

		this.topBuyers = []

		for(let i = 0; i < data.topBuyerAddress.length; i++) {
			const address = data.topBuyerAddress[i]

			if(address === "0x0000000000000000000000000000000000000000" || address === null) {
				break
			}

			const topBuyer = { address }

			topBuyer.ticketsBought = parseInt(data.topBuyerData[i * 6 + 0])
      topBuyer.lastBuyBlock = parseInt(data.topBuyerData[i * 6 + 1])
      topBuyer.lastBuyTimestamp = parseInt(data.topBuyerData[i * 6 + 2])
      topBuyer.payout = parseInt(data.topBuyerData[i * 6 + 3]) / 1e18
      topBuyer.balance = (parseInt(data.topBuyerData[i * 6 + 4]) / 1e18).toFixed(0)
      topBuyer.bonus = parseInt(data.topBuyerData[i * 6 + 5]) / 10

			this.topBuyers.push(topBuyer)
		}
	}

	get gameHasStarted() {
		return this.roundNumber > 0
	}

	calculateCooldownTimeLeft(gameCooldownBlocks) {
		if(!this.gameHasStarted) {
			return 0
		}

			this.secondsElapsedSinceLastPoll = Date.now()/1000 - this.currentBlockTimestamp
			this.blockElapsedSinceLastPoll = this.secondsElapsedSinceLastPoll/3
			this.cooldownBlocksLeft = gameCooldownBlocks - ((this.currentBlockNumber + this.blockElapsedSinceLastPoll) - this.endBlock)

	    const cooldownTimeLeft = this.cooldownBlocksLeft * 3

	    return cooldownTimeLeft
	}

	calculateTimeLeft() {
		if(!this.gameHasStarted) {
			return 0
		}

	    const timeElapsed = Math.floor(Date.now() / 1000) - this.currentBlockTimestamp
	    const timeLeft = (this.blocksLeft * 3) - timeElapsed - 15

	    return timeLeft
	}
}

export default GameStats
