pragma solidity ^0.4.21;
import "./Certification.sol";

/**
 * this interface represents the diplomas that a student has passed
 */
contract DappCertificate is Diploma {
    bytes32 private name;
    bytes32 private publisher;
        
    function DappCertificate(bytes32 _name, bytes32 _publisher) 
            public 
    {
        require(_name != 0);
        require(_publisher != 0);
        name =_name;
        publisher = _publisher;
    }
    
    function getName() 
            external 
            view 
            returns(bytes32 CertificateName)
    {
        return name;    
    }
    
    function getPublisher() 
            external 
            view 
            returns(bytes32 CertificatePublisher)
    {
        return publisher;
    }
}