import React, {Component} from 'react';
// import DataList from './components/DataList';
// import AddResourceModal from './components/AddResourceModal';
// import Graph from 'vis-react';
import {
    Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, Card, CardImg,
    CardBody, CardTitle, CardSubtitle, CardText, CardGroup, CardHeader, UncontrolledCollapse, Nav, NavItem, NavLink
} from 'reactstrap';
// import SplitPane from 'react-split-pane';
// import {NotificationContainer} from 'react-notifications';
import {submitGetRequest, url} from './helpers.js';
import './App.css';
import CodeContainer from "./components/CodeContainer";

class App extends Component {
    state = {
        allResources: null,
        allStatements: null,
        allPredicates: [],
        results: null,
        error: null,
        dropdownOpen: false,
        problemText: '',
    };

    query = '';

    constructor(props) {
        super(props);

        this.setState = this.setState.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.buildGraph = this.buildGraph.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.findAllResources = this.findAllResources.bind(this);
        this.findAllStatements = this.findAllStatements.bind(this);
        this.findAllPredicateNames = this.findAllPredicateNames.bind(this);
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    componentDidMount() {
        this.findAllResources();
        this.findAllStatements();
        this.findAllPredicateNames();

        window.addEventListener("hashchange", this.handleHashChange);
        this.handleHashChange();
    }

    // TODO: Run this after all queries completed.
    findAllPredicateNames(predicateIds) {
        const that = this;
        submitGetRequest(url + 'predicates/', (responseJson) => {
            that.setState({
                allPredicates: responseJson,
                error: null
            });
        },
        (err) => {
            console.error(err);
            that.setState({
                allPredicates: [],
                error: err.message,
            });
        });
    }

    handleHashChange() {
        const that = this;
        const hash = window.location.hash;

        if (hash) {
            if (hash.startsWith('#q=')) {
                const queryUrl = url + 'resources/?' + hash.substring(1);
                submitGetRequest(queryUrl,
                        (responseJson) => {
                            const results = responseJson.map(item => {
                                return {
                                    statementId: null,
                                    predicateId: null,
                                    resource: item
                                }
                            });
                            that.setState({
                                results: results,
                                error: null
                            });
                        },
                        (err) => {
                            console.error(err);
                            that.setState({
                                results: null,
                                error: err.message,
                            });
                        });
            } else if (hash.startsWith('#id=')) {
                const queryUrl = url + 'resources/' + hash.substring(4);
                submitGetRequest(queryUrl,
                        (responseJson) => {
                            const results = {
                                statementId: null,
                                predicateId: null,
                                resource: responseJson
                            };
                            that.setState({
                                results: [results],
                                error: null
                            });
                        },
                        (err) => {
                            console.error(err);
                            that.setState({
                                results: null,
                                error: err.message,
                            });
                        });
            } else {
                const errMsg = 'Incorrect hash value.';
                console.error(errMsg);
                that.setState({
                    results: null,
                    error: errMsg,
                });
            }
        }
    }

    handleSubmit(event) {
        // TODO: should we use state in this component or should we access form data?
        const formData = {};
        for (const field in this.refs) {
            formData[field] = this.refs[field].value;
        }

        event.preventDefault();
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    cropText(s) {
        const maxSize = 15;
        if (!s) {
            return null;
        }
        return (s.length <= maxSize) ? s : s.substring(0, maxSize - 3) + '...';
    }

    buildGraph(array) {
        const graph = {nodes: [], edges: []};

        array.forEach((value, index) => {
            const nodeId = value.id;
            graph.nodes.push({
                id: nodeId,
                label: this.cropText(value.label),
                scaling: {
                    label: {
                        enabled: true,
                    },
                },
                shape: 'circle',
                size: '30px',
                title: value.label
            });
        });

        const statements = this.state.allStatements;
        statements.forEach((value, index) => {
            switch (value.object.type) {
                case 'resource': {
                    graph.edges.push({
                        from: value.subject,
                        to: value.object.id,
                        // TODO: fetch the text of the predicate.
                        label: this.cropText(value.predicate)
                    });
                }
                case 'literal': {
                    graph.edges.push({
                        from: value.subject,
                        to: value.object.value,
                        // TODO: fetch the text of the predicate.
                        label: this.cropText(value.predicate)
                    });
                }
            }
        });

        return graph;
    }

    onSearchClick(event, data) {
        window.location.hash = 'q=' + encodeURIComponent(this.query);
    }

    findAllResources() {
        const that = this;

        submitGetRequest(url + 'resources/',
                (responseJson) => {
                    that.setState({
                        allResources: responseJson,
                        error: null,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        allResources: null,
                        error: err.message,
                    });
                });
    }

    findAllStatements() {
        const that = this;

        submitGetRequest(url + 'statements/',
                (responseJson) => {
                    that.setState({
                        allStatements: responseJson,
                        error: null,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        allStatements: null,
                        error: err.message,
                    });
                });
    }

    render() {
        return <div>
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
                <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">ORKG</a>
                <input className="form-control form-control-dark w-100" type="text" placeholder="Search (not implemented)"
                       aria-label="Search"/>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap">
                            <a className="nav-link" href="#">Sign in (not implemented)</a>
                        </li>
                    </ul>
            </nav>

            <div className="container-fluid">
                <div className="row">
                    <Nav className="bg-light" vertical>
                        <NavItem>
                            <NavLink href="/#/researchContributions/">Research contributions</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/#/problems/">Problems</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/#/researchContributions/">Approaches</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Implementations</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Evaluations</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Etc</NavLink>
                        </NavItem>
                    </Nav>

                    <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
                        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                            <h1 className="h2">Research contributions</h1>
                        </div>

                        <Card>
                            <CardHeader>Quick sort</CardHeader>
                            <CardBody>
                                <dl>
                                    <dt>Problem</dt>
                                    <dd>
                                        <dl>
                                            <dt>Name</dt>
                                            <dd>Sorting</dd>
                                            <dt>Class</dt>
                                            <dd>Comparison</dd>
                                        </dl>
                                    </dd>
                                </dl>

                                <dl>
                                    <dt>Implementation</dt>
                                    <dd>
                                        <dl>
                                            <dt>Name</dt>
                                            <dd>Quick sort</dd>
                                            <dt>Type</dt>
                                            <dd>Exchange sort</dd>
                                            <dt>Efficiency</dt>

                                            <dd>
                                                <dl>
                                                    <dt>Best</dt>
                                                    <dd>n log(n)</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Average</dt>
                                                    <dd>n log(n)</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Worst</dt>
                                                    <dd>n^2</dd>
                                                </dl>
                                            </dd>
                                            <dt>Space complexity</dt>
                                            <dd>
                                                <dl>
                                                    <dt>Average</dt>
                                                    <dd>log(n)</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Worst</dt>
                                                    <dd>n</dd>
                                                </dl>
                                            </dd>

                                            <dt>Partition scheme</dt>
                                            <dd>
                                                <dl>
                                                    <dt>Name</dt>
                                                    <dd>Lomuto</dd>
                                                    <dt>Code</dt>
                                                    <dd>
                                                        <CodeContainer>
{`algorithm quicksort(A, lo, hi) is
    if lo < hi then
        p := partition(A, lo, hi)
        quicksort(A, lo, p - 1 )
        quicksort(A, p + 1, hi)

algorithm partition(A, lo, hi) is
    pivot := A[hi]
    i := lo
    for j := lo to hi - 1 do
        if A[j] < pivot then
            swap A[i] with A[j]
            i := i + 1
    swap A[i] with A[hi]
    return i`}
                                                        </CodeContainer>
                                                    </dd>
                                                </dl>
                                            </dd>

                                            <dt>Partition scheme</dt>
                                            <dd>
                                                <dl>
                                                    <dt>Name</dt>
                                                    <dd>Hoare</dd>
                                                    <dt>Code</dt>
                                                    <dd>
                                                        <CodeContainer>
{`algorithm quicksort(A, lo, hi) is
    if lo < hi then
        p := partition(A, lo, hi)
        quicksort(A, lo, p)
        quicksort(A, p + 1, hi)

algorithm partition(A, lo, hi) is
    pivot := A[lo]
    i := lo - 1
    j := hi + 1
    loop forever
        do
            i := i + 1
        while A[i] < pivot

        do
            j := j - 1
        while A[j] > pivot

        if i >= j then
            return j

        swap A[i] with A[j]`}
                                                        </CodeContainer>
                                                    </dd>
                                                </dl>
                                            </dd>

                                            <dt>Variation</dt>
                                            <dd>Multi-pivot quick sort</dd>
                                            <dt>Variation</dt>
                                            <dd>External quick sort</dd>
                                            <dt>Variation</dt>
                                            <dd>Three-way radix quick sort</dd>
                                            <dt>Variation</dt>
                                            <dd>Quick radix quick sort</dd>
                                            <dt>Variation</dt>
                                            <dd>Partial and incremental quick sort</dd>
                                        </dl>
                                    </dd>
                                </dl>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader>Merge sort</CardHeader>
                            <CardBody>
                                <dl>
                                    <dt>Problem</dt>
                                    <dd>
                                        <dl>
                                            <dt>Name</dt>
                                            <dd>Sorting</dd>
                                            <dt>Class</dt>
                                            <dd>Comparison</dd>
                                        </dl>
                                    </dd>
                                </dl>

                                <dl>
                                    <dt>Implementation</dt>
                                    <dd>
                                        <dl>
                                            <dt>Name</dt>
                                            <dd>Merge sort</dd>
                                            <dt>Type</dt>
                                            <dd>Merge sort</dd>

                                            <dt>Efficiency</dt>
                                            <dd>
                                                <dl>
                                                    <dt>Best</dt>
                                                    <dd>n log(n)</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Average</dt>
                                                    <dd>n log(n)</dd>
                                                </dl>
                                                <dl>
                                                    <dt>Worst</dt>
                                                    <dd>n log(n)</dd>
                                                </dl>
                                            </dd>
                                            <dt>Space complexity</dt>
                                            <dd>n</dd>

                                            <dt>Variation</dt>
                                            <dd>
                                                <dl>
                                                    <dt>Name</dt>
                                                    <dd>Top-down merge sort</dd>
                                                    <dt>Code</dt>
                                                    <dd>
                                                        <CodeContainer>
{`// Array A[] has the items to sort; array B[] is a work array.
TopDownMergeSort(A[], B[], n)
{
    CopyArray(A, 0, n, B);           // duplicate array A[] into B[]
    TopDownSplitMerge(B, 0, n, A);   // sort data from B[] into A[]
}

// Sort the given run of array A[] using array B[] as a source.
// iBegin is inclusive; iEnd is exclusive (A[iEnd] is not in the set).
TopDownSplitMerge(B[], iBegin, iEnd, A[])
{
    if(iEnd - iBegin < 2)                       // if run size == 1
        return;                                 //   consider it sorted
    // split the run longer than 1 item into halves
    iMiddle = (iEnd + iBegin) / 2;              // iMiddle = mid point
    // recursively sort both runs from array A[] into B[]
    TopDownSplitMerge(A, iBegin,  iMiddle, B);  // sort the left  run
    TopDownSplitMerge(A, iMiddle,    iEnd, B);  // sort the right run
    // merge the resulting runs from array B[] into A[]
    TopDownMerge(B, iBegin, iMiddle, iEnd, A);
}

// Left source half is  A[ iBegin:iMiddle-1].
// Right source half is A[iMiddle:iEnd-1   ].
// Result is            B[ iBegin:iEnd-1   ].
TopDownMerge(A[], iBegin, iMiddle, iEnd, B[])
{
    i = iBegin, j = iMiddle;

    // While there are elements in the left or right runs...
    for (k = iBegin; k < iEnd; k++) {
        // If left run head exists and is <= existing right run head.
        if (i < iMiddle && (j >= iEnd || A[i] <= A[j])) {
            B[k] = A[i];
            i = i + 1;
        } else {
            B[k] = A[j];
            j = j + 1;
        }
    }
}

CopyArray(A[], iBegin, iEnd, B[])
{
    for(k = iBegin; k < iEnd; k++)
        B[k] = A[k];
}`}
                                                        </CodeContainer>
                                                    </dd>
                                                </dl>

                                            </dd>
                                            <dt>Variation</dt>
                                            <dd>
                                                <dt>Name</dt>
                                                <dd>Bottom-up merge sort</dd>
                                                <dt>Code</dt>
                                                <dd>
                                                    <CodeContainer>
{`// array A[] has the items to sort; array B[] is a work array
void BottomUpMergeSort(A[], B[], n)
{
    // Each 1-element run in A is already "sorted".
    // Make successively longer sorted runs of length 2, 4, 8, 16... until whole array is sorted.
    for (width = 1; width < n; width = 2 * width)
    {
        // Array A is full of runs of length width.
        for (i = 0; i < n; i = i + 2 * width)
        {
            // Merge two runs: A[i:i+width-1] and A[i+width:i+2*width-1] to B[]
            // or copy A[i:n-1] to B[] ( if(i+width >= n) )
            BottomUpMerge(A, i, min(i+width, n), min(i+2*width, n), B);
        }
        // Now work array B is full of runs of length 2*width.
        // Copy array B to array A for next iteration.
        // A more efficient implementation would swap the roles of A and B.
        CopyArray(B, A, n);
        // Now array A is full of runs of length 2*width.
    }
}

// Left run is  A[iLeft :iRight-1].
// Right run is A[iRight:iEnd-1  ].
void BottomUpMerge(A[], iLeft, iRight, iEnd, B[])
{
    i = iLeft, j = iRight;
    // While there are elements in the left or right runs...
    for (k = iLeft; k < iEnd; k++) {
        // If left run head exists and is <= existing right run head.
        if (i < iRight && (j >= iEnd || A[i] <= A[j])) {
            B[k] = A[i];
            i = i + 1;
        } else {
            B[k] = A[j];
            j = j + 1;
        }
    }
}

void CopyArray(B[], A[], n)
{
    for(i = 0; i < n; i++)
        A[i] = B[i];
}`}
                                                    </CodeContainer>
                                                </dd>
                                            </dd>
                                            <dt>Variation</dt>
                                            <dd>
                                                <dt>Name</dt>
                                                <dd>Top-down merge sort using lists</dd>
                                                <dt>Code</dt>
                                                <dd>
                                                    <CodeContainer>
{`function merge_sort(list m)
    // Base case. A list of zero or one elements is sorted, by definition.
    if length of m ≤ 1 then
        return m

    // Recursive case. First, divide the list into equal-sized sublists
    // consisting of the first half and second half of the list.
    // This assumes lists start at index 0.
    var left := empty list
    var right := empty list
    for each x with index i in m do
        if i < (length of m)/2 then
            add x to left
        else
            add x to right

    // Recursively sort both sublists.
    left := merge_sort(left)
    right := merge_sort(right)

    // Then merge the now-sorted sublists.
    return merge(left, right)

function merge(left, right)
    var result := empty list

    while left is not empty and right is not empty do
        if first(left) ≤ first(right) then
            append first(left) to result
            left := rest(left)
        else
            append first(right) to result
            right := rest(right)

    // Either left or right may have elements left; consume them.
    // (Only one of the following loops will actually be entered.)
    while left is not empty do
        append first(left) to result
        left := rest(left)
    while right is not empty do
        append first(right) to result
        right := rest(right)
    return result`}
                                                    </CodeContainer>
                                                </dd>
                                            </dd>
                                            <dt>Variation</dt>
                                            <dd>
                                                <dt>Name</dt>
                                                <dd>Bottom-up merge sort using lists</dd>
                                                <dt>Code</dt>
                                                <dd>
                                                    <CodeContainer>
{`function merge_sort(node head)
    // return if empty list
    if (head == nil)
        return nil
    var node array[32]; initially all nil
    var node result
    var node next
    var int  i
    result = head
    // merge nodes into array
    while (result != nil)
         next = result.next;
         result.next = nil
         for(i = 0; (i < 32) && (array[i] != nil); i += 1)
              result = merge(array[i], result)
              array[i] = nil
         // do not go past end of array
         if (i == 32)
               i -= 1
         array[i] = result
         result = next
    // merge array into single list
    result = nil
    for (i = 0; i < 32; i += 1)
         result = merge(array[i], result)
    return result

function merge(left, right)
    var result := empty list

    while left is not empty and right is not empty do
        if first(left) ≤ first(right) then
            append first(left) to result
            left := rest(left)
        else
            append first(right) to result
            right := rest(right)

    // Either left or right may have elements left; consume them.
    // (Only one of the following loops will actually be entered.)
    while left is not empty do
        append first(left) to result
        left := rest(left)
    while right is not empty do
        append first(right) to result
        right := rest(right)
    return result`}
                                                    </CodeContainer>
                                                </dd>
                                            </dd>
                                        </dl>
                                    </dd>
                                </dl>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader>Bubble sort</CardHeader>
                            <CardBody>
                                <CardText>
                                    <dl>
                                        <dt>Problem</dt>
                                        <dd>
                                            <dl>
                                                <dt>Name</dt>
                                                <dd>Sorting</dd>
                                                <dt>Class</dt>
                                                <dd>Comparison</dd>
                                            </dl>
                                        </dd>

                                        <dt>Implementation</dt>
                                        <dd>
                                            <dl>
                                                <dt>Name</dt>
                                                <dd>Bubble sort</dd>
                                                <dt>Type</dt>
                                                <dd>Exchange sort</dd>

                                                <dt>Efficiency</dt>
                                                <dd>
                                                    <dl>
                                                        <dt>Best</dt>
                                                        <dd>n</dd>
                                                    </dl>
                                                    <dl>
                                                        <dt>Average</dt>
                                                        <dd>n^2</dd>
                                                    </dl>
                                                    <dl>
                                                        <dt>Worst</dt>
                                                        <dd>n^2</dd>
                                                    </dl>
                                                </dd>
                                                <dt>Space complexity</dt>
                                                <dd>1</dd>

                                                <dt>Variation</dt>
                                                <dd>Odd-even sort</dd>
                                                <dt>Variation</dt>
                                                <dd>Cocktail shaker sort</dd>

                                                <dt>Code</dt>
                                                <dd>
                                                    <CodeContainer>
{`procedure bubbleSort( A : list of sortable items )
    n = length(A)
    repeat
        newn = 0
        for i = 1 to n-1 inclusive do
            if A[i-1] > A[i] then
                swap(A[i-1], A[i])
                newn = i
            end if
        end for
        n = newn
    until n = 0
end procedure`}
                                                    </CodeContainer>
                                                </dd>
                                            </dl>
                                        </dd>
                                    </dl>
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader>Slow sort</CardHeader>
                            <CardBody>
                                <CardText>
                                    <dl>
                                        <dt>Problem</dt>
                                        <dd>
                                            <dl>
                                                <dt>Name</dt>
                                                <dd>Sorting</dd>
                                                <dt>Class</dt>
                                                <dd>Comparison</dd>
                                            </dl>
                                        </dd>

                                        <dt>Implementation</dt>
                                        <dd>
                                            <dl>
                                                <dt>Name</dt>
                                                <dd>Slow sort</dd>
                                                <dt>Type</dt>
                                                <dd>Exchange sort</dd>

                                                <dt>Efficiency</dt>
                                                <dd>n^(log(n))</dd>

                                                <dt>Code</dt>
                                                <dd>
                                                    <CodeContainer>
{`procedure slowsort(A,i,j)                  // sorts Array A[i],...,A[j]
    if i >= j then return
    m := ⌊(i+j)/2⌋
    slowsort(A,i,m)                        // (1.1)
    slowsort(A,m+1,j)                      // (1.2)
    if A[j] < A[m] then swap A[j] and A[m] // (1.3)
    slowsort(A,i,j-1)                      // (2)`}
                                                    </CodeContainer>
                                                </dd>
                                            </dl>
                                        </dd>
                                    </dl>
                                </CardText>
                            </CardBody>
                        </Card>
                    </main>
                </div>
            </div>
        </div>

//         const resultsPresent = this.state.error || (this.state.results && this.state.allResources);
//         const hash = window.location.hash;
//         const searchForm = (<div>
//                     <header className="App-header">
//                         <h1 className="App-title">Search</h1>
//                     </header>
//                     <Form>
//                         <Form.Field>
//                             <Form.Input defaultValue={hash && hash.startsWith('#q=')
//                                     ? decodeURIComponent(window.location.hash.substring(3)) : null}
//                                     onChange={(event, data) => this.query = data.value.trim()}/>
//                             <Button onClick={this.onSearchClick}>Search</Button>
//                         </Form.Field>
//                     </Form>
//                 </div>);
//         if (!resultsPresent) {
//             return searchForm;
//         }
//         if (this.state.error) {
//             return (<p><strong>Error:</strong> {this.state.error} </p>);
//         }
//
//         const graph = this.buildGraph(this.state.results);
//
//         const options = {
//             autoResize: true,
//             edges: {
//                 color: "#000000"
//             },
//             height: '500px',
//         };
//
//         const events = {
//             select: function(event) {
// //                var { nodes, edges } = event;
//             }
//         };
//
//         return <div className="App">
//             <NotificationContainer/>
//             {searchForm}
//             <SplitPane split="vertical" minSize={250} defaultSize={800}>
//                 <div><Graph graph={graph} options={options} events={events}/></div>
//                 <div>
//                     <header className="App-header">
//                         <h1 className="App-title">Results&nbsp;<AddResourceModal/></h1>
//                     </header>
//                     <DataList data={this.state.results} allResources={this.state.allResources}
//                             allPredicates={this.state.allPredicates} level={0}/>
//                 </div>
//             </SplitPane>
//         </div>
    }
}

export default App;
