import React, {Component} from 'react';
import {Container, Navbar} from 'react-bootstrap';

class TopNav extends Component {
    render () {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">NFT Token Airdrop</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                </Container>
            </Navbar>
        );
    }
}

export default TopNav;