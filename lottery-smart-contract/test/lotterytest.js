const Lottery = artifacts.require("Lottery");
// const { assert } = require('chai');
// const { assert } = require('chai');
const assertRevert = require('./asserRevert')
const expectEvent = require ('./expectEvent')
contract('Lottery', function([deployer, user1, user2]){
    let lottery;
    let betAmount = 5 * 10 ** 15;
    let betAmountBN = new web3.utils.BN('5000000000000000');
    let bet_block_interval = 3;
    beforeEach(async () =>{
        console.log('before each')
        lottery = await Lottery.new();
        // 여기서 배포한 스마트 컨트랙트를 사용하는것이 가장 좋다
    })
    // 0xa4b004dCF23B62164c66f769F192A47eD46A072b

    it('getPot should return current pot', async() => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0)
    })

    describe('Bet', function() {
        it('should fail when the bet money is not 0.005 ETH', async() => {
            // fail transaction
           await  assertRevert(lottery.bet('0xab', {from : user1, value:4000000000000000}))

            // transction object {chainId, value, to, from, gas(Limit),gasPrice}
        })
        it('should put the bet queue with 1 bet', async() => {
            // bet
            let receipt = await  lottery.bet('0xab', {from : user1, value:betAmount})
            // console.log(receipt)
            let pot = await lottery.getPot();
            assert.equal(pot, 0);

            // check contract balance == 0.005
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount)
            // check bet info
            let currentBlockNumber = await web3.eth.getBlockNumber();
            let bet = await lottery.getBetInfo(0);
            assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval);
            assert.equal(bet.bettor, user1);
            assert.equal(bet.challenges, '0xab');

            // log
            await expectEvent.inLogs(receipt.logs, 'BET')
            
        })
    })
    describe('Distribute', function () {
        describe('when the answer is checkable', function () {
            it('should give the user the pot when the answer matches', async ()=>{
                // 두 글자 다 맞았을 때
               await lottery.setAnswerForTest('0xab9f94c28a76e7781115ca3967bc17ef2a39ad8a10a78b84cd8917225a7ce808', {from:deployer})
               
               await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //1번 블록 ->4
               await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //2->5
               await lottery.betAndDistribute('0xab', {from:user1, value:betAmount}) //3->6
               await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //4->7
               await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //5->8
               await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //6->9

                let potBefore = await lottery.getPot(); // ==0.01 eth
                let userBalanceBefore = await web3.eth.getBalance(user1);
                
                let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount})//7->10 user1에게 pot이 간다
                
                let potAfter = await lottery.getPot(); // == 0
                let userBalanceAfter = await web3.eth.getBalance(user1); // == before + 0.015 eth
                // pot 의 변화량 확인
                assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
                assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());
               
                // user(winner)의 밸런스를 확인
                userBalanceBefore = new web3.utils.BN(userBalanceBefore);
                assert.equal(userBalanceBefore.add(potBefore).add(betAmountBN).toString(),new web3.utils.BN(userBalanceAfter).toString());
           
            })
            it('should give the user the amount he or she bet when a single character matches', async ()=>{
                // 한 글자 맞았을 때
                await lottery.setAnswerForTest('0xab9f94c28a76e7781115ca3967bc17ef2a39ad8a10a78b84cd8917225a7ce808', {from:deployer})
               
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //1번 블록 ->4
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //2->5
                await lottery.betAndDistribute('0xaf', {from:user1, value:betAmount}) //3->6
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //4->7
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //5->8
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //6->9
 
                 let potBefore = await lottery.getPot(); // ==0.01 eth
                 let userBalanceBefore = await web3.eth.getBalance(user1);
                 
                 let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount})//7->10 user1에게 pot이 간다
                 
                 let potAfter = await lottery.getPot(); // == 0.01 eth
                 let userBalanceAfter = await web3.eth.getBalance(user1); // == before + 0.005 eth
                 // pot 의 변화량 확인
                 assert.equal(potBefore.toString(), potAfter.toString());
                
                 // user(winner)의 밸런스를 확인
                 userBalanceBefore = new web3.utils.BN(userBalanceBefore);
                 assert.equal(userBalanceBefore.add(betAmountBN).toString(),new web3.utils.BN(userBalanceAfter).toString());
            
            })
            it('should get the eth of user when the answer does not match at all', async ()=>{
                // 다 틀렸을 때
                await lottery.setAnswerForTest('0xab9f94c28a76e7781115ca3967bc17ef2a39ad8a10a78b84cd8917225a7ce808', {from:deployer})
               
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //1번 블록 ->4
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //2->5
                await lottery.betAndDistribute('0xef', {from:user1, value:betAmount}) //3->6
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //4->7
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //5->8
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) //6->9
 
                 let potBefore = await lottery.getPot(); // ==0.01 eth
                 let userBalanceBefore = await web3.eth.getBalance(user1);
                 
                 let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount})//7->10 user1에게 pot이 간다
                 
                 let potAfter = await lottery.getPot(); // == 0.015 eth
                 let userBalanceAfter = await web3.eth.getBalance(user1); // == before 
                 // pot 의 변화량 확인
                 assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());
                
                 // user(winner)의 밸런스를 확인
                 userBalanceBefore = new web3.utils.BN(userBalanceBefore);
                 assert.equal(userBalanceBefore.toString(),new web3.utils.BN(userBalanceAfter).toString());
            
            })

        })
        describe('when the answer is not revealed(Not Mined)', function () {
            // 한번 해보세요
        })

        describe('when the answer is not revealed(Block limit is passed)', function () {
            // 한번 해보세요
        })
    })
    describe('isMatch', function () {
        let blockHash = '0xab9f94c28a76e7781115ca3967bc17ef2a39ad8a10a78b84cd8917225a7ce808'
        it('should be BettingResult.Win when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xab',blockHash);
            assert.equal(matchingResult, 1);
        });

        it('should be BettingResult.Fail when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xcd',blockHash);
            assert.equal(matchingResult, 0);
        });

        it('should be BettingResult.Draw when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xaf',blockHash);
            assert.equal(matchingResult, 2);

            matchingResult = await lottery.isMatch('0xfb',blockHash);
            assert.equal(matchingResult, 2);
        });
    });
});