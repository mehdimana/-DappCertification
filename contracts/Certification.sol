pragma solidity ^0.4.21;
import "./Mortal.sol";
import "./Stoppable.sol";

/**
 * this interface represents the diplomas that a student has passed
 */
interface Diploma {
    function getName() external view returns(bytes32 name);
    function getPublisher() external view returns(bytes32 publisher);
}

contract Certification is Mortal, Stoppable {
    struct CertificateType {
        address student;
        bytes32 name;
        uint dateOfBirth;
        Diploma[] diplomas; 
    }
    
    mapping(address => CertificateType) certificates;
    mapping(address => Diploma[]) studentDiplomas; //student address -> diplomas
    event LogCreateCertificate (address student, bytes32 name, uint dateOfBirth, Diploma[] diplomas);
    
    /**
     * create of update a student certification information
     * only accesssible by owner of this contract
     */
    function createUpdateCertificate(address student, bytes32 name, uint dateOfBirth, Diploma[] diplomas) 
            external
            accessibleByOwnerOnly
            onlyIfrunning
    {
        require(student != address(0));
        require(dateOfBirth > 0);
        require(name != 0);
        
        studentDiplomas[student] = diplomas;
        certificates[student] = CertificateType(student, name, dateOfBirth, diplomas);
        emit LogCreateCertificate(student, name, dateOfBirth, diplomas);
    }
    
    /**
     * retreive certification information for a specific student
     */
    function getCertificateForAddress(address student)
            external
            view
            onlyIfrunning
            returns(address owner, bytes32 name, uint dateOfBirth, Diploma[] diplomas)
    {
        require(student != address(0));
        CertificateType storage cert = certificates[student];
        require(cert.student != address(0));
        return (cert.student, cert.name, cert.dateOfBirth, cert.diplomas);
    }
    
    /** 
     * return all diplomas of a studen
     */
    function getDiplomasForAddress(address student)
            external
            view
            onlyIfrunning
            returns(Diploma[] diplomas) 
    {
        require(student != address(0));
        return studentDiplomas[student];
    }
            
}