// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract ChainMS {
    mapping(address => mapping(string => string)) public addressesData;

    function store(string calldata identifier, string calldata data) public {
        addressesData[msg.sender][identifier] = data;
    }

    function retrieve(
        address addr,
        string calldata identifier
    ) public view returns (string memory) {
        return addressesData[addr][identifier];
    }
}
