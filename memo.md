# https://github.com/orgs/OpenZeppelin/repositories?page=2
이더쪽에서는 잘 쓰는곳 여기있는 코드들 가져다 쓰는게 가장 좋다.

# ganache-cli -d -m tutorial

# truffle migrations --reset 
배포할때 리셋을 치는게 좋다 마이그레이션안에 파일들을 항상 1번부터 시작하게 한다

# truffle test test/lotterytest.js 
테스트 파일 실행 명령어

#  truffle complie

# truffle console 파워셀에서
# web3.eth.getBlockNumber()
# web3.eth.getBlock(34)
# hash: '0xf69f94c28a76e7781115ca3967bc17ef2a39ad8a10a78b84cd8917225a7ce808', 가져왓음

# https://en.wikipedia.org/wiki/Standard_52-card_deck
카드가 공짜

# Lottery.deployed().then(function(instance){lt=instance})

1 컴파일 한 파일 2개 삭제
2 컴파일 진행
3 마이그레이션 진행
4 abi address 변경