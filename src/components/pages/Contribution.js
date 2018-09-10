import React, {Component} from 'react';
import StatementsCard from "../statements/StatementsCard";
import Statement from "../statements/Statement";

export default class Contribution extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <div
                className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <h1 className="h2">Quick sort</h1>
            </div>

            Average-case optimal divide and conquer comparison sorting algorithm

            <StatementsCard href="#" label="instance of">
                <Statement><a href="#">Research contribution</a></Statement>
                <Statement><a href="#">Comparison sort</a></Statement>
            </StatementsCard>

            <StatementsCard href="#" label="addresses">
                <Statement><a href="#">Array sorting</a></Statement>
            </StatementsCard>

            <StatementsCard href="#" label="employs">
                <Statement><a href="#">Quick sort method</a></Statement>
                <Statement><a href="#">Quick sort formal analysis</a></Statement>
                <Statement><a href="#">Lomuto partition scheme</a></Statement>
                <Statement><a href="#">Hoare partition scheme</a></Statement>
            </StatementsCard>

            <StatementsCard href="#" label="yields">
                <Statement/>
            </StatementsCard>

            {/*<StatementsCard href="#" label="worst-case performance">*/}
            {/*<Statement>*/}
            {/*n^2*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}

            {/*<StatementsCard href="#" label="best-case performance">*/}
            {/*<Statement>*/}
            {/*n log(n)*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}

            {/*<StatementsCard href="#" label="average performance">*/}
            {/*<Statement>*/}
            {/*n log(n)*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}

            {/*<StatementsCard href="#" label="worst-case space complexity">*/}
            {/*<Statement>*/}
            {/*n*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}

            {/*<StatementsCard href="#" label="average space complexity">*/}
            {/*<Statement>*/}
            {/*log(n)*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}

            {/*<StatementsCard href="#" label="code">*/}
            {/*<Statement>*/}
            {/*<CodeContainer>*/}
            {/*{`algorithm quicksort(A, lo, hi) is*/}
            {/*if lo < hi then*/}
            {/*p := partition(A, lo, hi)*/}
            {/*quicksort(A, lo, p - 1 )*/}
            {/*quicksort(A, p + 1, hi)*/}

            {/*algorithm partition(A, lo, hi) is*/}
            {/*pivot := A[hi]*/}
            {/*i := lo*/}
            {/*for j := lo to hi - 1 do*/}
            {/*if A[j] < pivot then*/}
            {/*swap A[i] with A[j]*/}
            {/*i := i + 1*/}
            {/*swap A[i] with A[hi]*/}
            {/*return i`}*/}
            {/*</CodeContainer>*/}
            {/*<CodeContainer>*/}
            {/*{`algorithm quicksort(A, lo, hi) is*/}
            {/*if lo < hi then*/}
            {/*p := partition(A, lo, hi)*/}
            {/*quicksort(A, lo, p)*/}
            {/*quicksort(A, p + 1, hi)*/}

            {/*algorithm partition(A, lo, hi) is*/}
            {/*pivot := A[lo]*/}
            {/*i := lo - 1*/}
            {/*j := hi + 1*/}
            {/*loop forever*/}
            {/*do*/}
            {/*i := i + 1*/}
            {/*while A[i] < pivot*/}

            {/*do*/}
            {/*j := j - 1*/}
            {/*while A[j] > pivot*/}

            {/*if i >= j then*/}
            {/*return j*/}

            {/*swap A[i] with A[j]`}*/}
            {/*</CodeContainer>*/}
            {/*</Statement>*/}
            {/*</StatementsCard>*/}
        </div>
    }

}