import React, {Component} from 'react';
import { FormControl,InputGroup, Button } from 'react-bootstrap';
import Web3 from 'web3';
import {tokenABI, RPC, data} from './config' 
import { MDBDataTableV5 } from 'mdbreact';








const web3  = new Web3(new Web3.providers.HttpProvider(RPC));
class Display extends Component {
    constructor(props) {
        super(props)
        this.state = {
            walletAddress : '',
            privateKey    : '',
            tokenAddress  : '',
            tokenStartID  : 1,
            tableDatas    : [],
            nonce         : 0,
            number        : 1,
            gasPrice      : '225',
            gasLimit      : '100000',
            isAirdrop     : false
        }
    }

    async start(){
        console.log(data)
        if(this.state.tokenAddress === ''||this.state.tokenStartID === ''||this.state.privateKey === ""||this.state.walletAddress===''){
            alert("please check input value")
            return
        }
        if(web3.utils.checkAddressChecksum(this.state.walletAddress)===false){
            alert("please check wallet address")
            return
        }
        if(web3.utils.checkAddressChecksum(this.state.tokenAddress)===false){
            alert("please check token address")
            return
        }
        this.setState({
            isAirdrop : true
        })
        this.preTransaction()
    }

    async addressCheck(){
        let result = true
        for (let i = 0; i < data.length; i++) {
            console.log(i)
            try{
                let address = await web3.utils.toChecksumAddress(data[i].address)
                data[i].address = address
            }catch(err){
                   alert("please check " +  parseInt(i+1) + "th address! "+ data[i].address+" is not checksum address")
                   result = false
            }
        }

        if(result === true){
            alert("address check result : OK" + "number of address is " + data.length )
        }
    }

    async ownerCheck(){
        let result = true

        let number = this.state.tokenStartID
        for (let i = 0; i < data.length; i++) {
            number = parseInt(number) + parseInt(data[i].number)
        }

        let tokenContract = new web3.eth.Contract(tokenABI, this.state.tokenAddress)

        for (let j = this.state.tokenStartID; j <number; j++) {
            try{
                let address = await tokenContract.methods.ownerOf(j).call()
                console.log(address)
                if( address !== this.state.walletAddress){
                    alert("please check owner address" + j + "th Token's owner isn't "+ this.state.walletAddress)
                    result = false
                }
            }catch(err){
                alert(j + "th Token's owner isn't minted yet")
                result = false
            }
            
        }
        if (result === true){
            alert("owner checking result : OK")
        }
    }


    async balanceCheck(){
        let number = 0
        let result = true
        for (let i = 0; i < data.length; i++) {
            number = parseInt(number) + parseInt(data[i].number)
        }
        let balance =await web3.eth.getBalance(this.state.walletAddress)
        balance = balance / 1000000000000000000
        let gas = parseInt(this.state.gasPrice) * (this.state.gasLimit) * number /1000000000
        console.log(gas)

        if (balance < gas){
            alert("Warning : Wallet Balance isn't enough for airdrop. " + "your wallet balance is " + balance + ". for airdrop " + gas + "is needed")
        } else {
            alert("Wallet balance checking result : OK, " +  gas  + " is needed for airdrop"+ "token number is "+ number) 
        }
    }

    async preTransaction(){
        let tokenContract

        try{
            tokenContract = new web3.eth.Contract(tokenABI, this.state.tokenAddress)
        }catch(err){
            this.setState({
                isAirdrop : false
            })
        }

        this.setState({
            nonce :  await web3.eth.getTransactionCount(this.state.walletAddress)
        })

        try{
            for (let i = 0; i < data.length; i++) {
                let address = data[i].address
                let number  = data[i].number
                for (let j = 0; j < number; j++) {
                    let nowTokenId = parseInt(this.state.tokenStartID)
                    let nonce = this.state.nonce
                    let number= this.state.number
                    let status =<p className='text-warning'> Pending... </p>
                    let tableDatas = this.state.tableDatas
    
                    let tableData = {
                        ID :  nowTokenId,
                        fromAddress : this.state.walletAddress,
                        toAddress   : address,
                        number      : number,
                        status      : status
                    }
                    tableDatas.push(tableData)
                    this.transaction(tokenContract, address ,nowTokenId, nonce, number)
                    nowTokenId = nowTokenId + 1
                    nonce = nonce + 1
                    number = number + 1
                    await this.setState({
                        tokenStartID : nowTokenId,
                        nonce : nonce,
                        tabledatas : tableDatas,
                        number : number
                    })
                }
            }

        }catch(err){
            this.setState({
                isAirdrop : false
            })
        }
    }

    async transaction(tokenContract,address, nowTokenId, nonce, number){
        let tx = {
            from : this.state.walletAddress,
            to   : this.state.tokenAddress,
            data : tokenContract.methods.transferFrom(this.state.walletAddress, address, nowTokenId).encodeABI(),
            gasPrice : web3.utils.toWei("225", 'Gwei'),
            gas      : "3500775",
            nonce    : nonce
          }
          try{
            const promise = await web3.eth.accounts.signTransaction(tx, this.state.privateKey)        
            await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {

                console.log(address, nowTokenId, "conform")
                let tableDatas = this.state.tableDatas
                tableDatas[number -1].status = <p className='text-success'> transfer success </p>
                this.setState({
                    tabledatas:tableDatas
                })

            })
          }catch(err){
            let tableDatas = this.state.tableDatas
            tableDatas[number -1].status = <p className='text-danger'> transfer failed </p>
            this.setState({
                tabledatas:tableDatas
            })
            console.log(err)
          }
    }

    render () {


        const datatable = {
            columns : [
              {
                  label : 'No',
                  field : 'number',
              },
              {
                  label : 'TokenID',
                  field : 'ID',
              },
              {
                  label : 'From',
                  field : 'fromAddress',
              },
              {
                 label : 'To',
                 field : 'toAddress',
              },
              {
                 label : 'status',
                 field : 'status',
              },
            ],
            rows : this.state.tableDatas,
        }
        const handleTokenAddress =  (e) => {
            let addLabel  = e.target.value
            this.setState({
                tokenAddress : addLabel
            }) 
        }   
        const handleTokenID =  (e) => {
            let addLabel  = e.target.value
            this.setState({
                tokenStartID : addLabel
            }) 
        }    
        const handleWalletAddress =  (e) => {
            let addLabel  = e.target.value
            this.setState({
                walletAddress : addLabel
            }) 
        }  
        const handlePrivateKey =  (e) => {
            let addLabel  = e.target.value
            this.setState({
                privateKey : addLabel
            }) 
        }  
        return (
            <div>
                <br/><br/>
                <div className = "row">
                    <div className = "col-1"></div>

                    <div className = "col-7">
                        <h4>Status Table</h4><hr/><br/>
                        <MDBDataTableV5 hover entriesOptions={[5,10,20,50,100,200,500,1000]} entries={100} pagesAmount={1000} data={datatable}  materialSearch /><br/><br/>
                    </div>
                    <div className = "col-3">
                    <h4>Owner Address</h4><hr/><br/>
                        <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                           &nbsp;&nbsp;&nbsp;Wallet Address
                        </InputGroup.Text>
                        <FormControl id="basic-url" aria-describedby="basic-addon3" defaultValue = {this.state.walletAddress} onChange={handleWalletAddress}/>
                        </InputGroup><br/>
                        <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                         &nbsp;&nbsp;&nbsp; Private Key
                        </InputGroup.Text>
                        <FormControl id="basic-url" aria-describedby="basic-addon3" defaultValue = {this.state.privateKey} onChange={handlePrivateKey}/>
                      </InputGroup><br/><br/>
                      <h4>Token Information</h4><hr/><br/>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                           &nbsp;&nbsp;&nbsp;Token Address
                        </InputGroup.Text>
                        <FormControl id="basic-url" aria-describedby="basic-addon3" defaultValue = {this.state.tokenAddress} onChange={handleTokenAddress}/>
                      </InputGroup><br/>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                         &nbsp;&nbsp;&nbsp; Token ID
                        </InputGroup.Text>
                        <FormControl id="basic-url" aria-describedby="basic-addon3" defaultValue = {this.state.tokenStartID} onChange={handleTokenID}/>
                      </InputGroup><br/><br/>
                      <Button variant="primary" style = {{width : '100%'}} onClick = {()=>this.addressCheck()}>Check valid Address</Button><br/><br/>
                      <Button variant="primary" style = {{width : '100%'}} onClick = {()=>this.ownerCheck()}> Check token's Owner</Button><br/><br/>
                      <Button variant="primary" style = {{width : '100%'}} onClick = {()=>this.balanceCheck()}>Check Balance</Button><br/><br/><br/>

                      <Button variant="success" style = {{width : '100%'}} onClick = {()=>this.start()}>Airdrop</Button><br/><br/>
                    </div>
                    <div className = "col-1"></div>
                </div>
            </div>
        );
    }
}

export default Display;