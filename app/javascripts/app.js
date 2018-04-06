const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
require("file-loader?name=../index.html!../index.html");
const $ = require("jquery");
// Not to forget our built contract
const certification = require("../../build/contracts/Certification.json");
const dappCertificate = require("../../build/contracts/DappCertificate.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const DappCertificate = truffleContract(dappCertificate);
DappCertificate.setProvider(web3.currentProvider);

const Certification = truffleContract(certification);
Certification.setProvider(web3.currentProvider);

window.addEventListener('load', function() {
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
            window.account = accounts[0];

            //update account dropdown
            $("#account-select").empty();
            for(i=0; i<accounts.length; i++) {
                $("#account-select").append($("<option></option>")
                                   .attr("value", accounts[i]).text(i + ": " + accounts[i]));
                $("#student-select").append($("<option></option>")
                                   .attr("value", accounts[i]).text(i + ": " + accounts[i]));
            }
            $("#account-select").change(function(){
                updateBalance($(this).val());
            });
            // console.log("Account:", window.account);
            return web3.version.getNetworkPromise();
        })
        .then(network => console.log("Network:", network.toString(10)))
        .then(() => watchEvents())
        .then(() => updateBalance($("#account-select").val()))
        .then(() => $("#create-cert").click(createCertification))
        .then(() => $("#create-diploma").click(createDiploma))
        .then(() => $("#retrieve-cert").click(retrieveCert))
        // Never let an error go unlogged.
        .catch(console.error);
});

const updateBalance = function(accountSelected) {
  return web3.eth.getBalancePromise(accountSelected)
                 .then(balance => {
                    $("#balance").html(balance.toString(10))
                 }).catch(console.error);
};

const watchEvents = function() {
  var deployed;
  return Certification.deployed().then( deploy => {
          deployed = deploy;
            return deployed.LogCreateCertificate({from: account});
         }).then( event => {
            watchEvent(event);
         });

}

const watchEvent = function(event) {
   event.watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    console.log("Event received: " + result.event);
    updateStatus("Event received: " + result.event);
    updateStatus(result.args.toSource());
    console.log(result.args);
  })
}

var diplomaAddress;

const createDiploma = function() {
  return DappCertificate.new("cert-name", "publisher",
                             {from: $("#account-select").val(), gas: 5000000})
  .then(instance => {
    diplomaAddress = instance.address;
    $("#diploma-hash").html(diplomaAddress);
  }).catch(console.error);
}

const createCertification = function() {
   return Certification.deployed()
  .then( deploy => {
    deployed = deploy;
    var diplomas = [];
    diplomas[0] = diplomaAddress;

    return deployed.createUpdateCertificate.sendTransaction($("#student-select").val(),
                                                            $("input[name='name-input']").val(),
                                                            $("input[name='dob-input']").val(),
                                                            diplomas,
                                                             {from: $("#account-select").val(), gas: 5000000}); 
  }).then(txHash => {
     return web3.eth.getTransactionReceiptPromise(txHash);
  }).then(txObject => {
    if (txObject.status == "0x01" || txObject.status == 1) {
      updateStatus("game created successsfuly.");
    } else {
      updateStatus("error creating game.");
      console.error(txObject);
    }
  }).catch(console.error);

}

const retrieveCert = function() {
  return Certification.deployed()
  .then( deploy => {
    deployed = deploy;
    console.log(deployed);
    var diplomas = [];
    diplomas[0] = diplomaAddress;

    return deployed.getCertificateForAddress.call($("#account-select").val()); 
  }).then(result => {
     console.log(result);
     $("#student").html(result[0]);
     $("#name").html(result[1]);
     $("#dob").html(result[2].toString(10));
     $("#diplomas").html(result[3]);

  }).catch(console.error);
}

var statusIndex=1;

const updateStatus = function(text) {
  $("#status").html(statusIndex++ + "- " + text + "<br>" + $("#status").html());
}