import React, { Component } from 'react';
import { Container } from 'reactstrap';

class License extends Component {

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">License</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    <h2>Data</h2>
                    <p>No decisions has been made yet on the license of the data. {/* TODO: add correct license */}</p>

                    <h2>Code</h2>

                    <p>The code of ORKG is made available under the MIT license:</p>

                    <p>Copyright 2018-{new Date().getFullYear()} {/* TODO: add name of copyright holder */}</p>

                    <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
                    
                    <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
                    
                    <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
                </Container>
            </div>
        );
    }
}

export default License;