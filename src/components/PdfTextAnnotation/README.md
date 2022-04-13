# Crowdsourcing Scholarly Discourse Annotations

_This code and document are part of the paper "Crowdsourcing Scholarly Discourse Annotations"_

This directory contains the User Interface (UI) elements for the annotation tool. The code itself should be understandable without a detailed explanation. This readme file briefly explains the code by listing the dependencies and the components.

# Dependencies, libraries and services

The code has multiple dependencies, the most important ones are listed below (for a full list of frontend dependencies, see the `package.json` file).

-   Frontend (this repository)
    -   [React](https://reactjs.org/) as frontend library
    -   [Redux](https://redux.js.org/) for state management
    -   [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for in-browser rendering of PDF files
    -   [React PDF Highlighter](https://github.com/agentcooper/react-pdf-highlighter) for highlighting sentences within PDF files (forked)
    -   [React dropzone](https://github.com/react-dropzone/react-dropzone) support for drag and drop file upload
    -   [Discourse Elements Ontology](http://purl.org/spar/deo) for the annotation classes list
-   Python support service ([repository](https://gitlab.com/TIBHannover/orkg/annotation/-/blob/36e14445c0a1a08701fc9762ba91b78da9e498ae/annotator/views.py))
    -   [Bert Extractive Summarizer](https://github.com/dmmiller612/bert-extractive-summarizer/) for generating abstracts from uploaded articles. The sentences from the generated abstract are displayed as highlights in the text
    -   [Hugging Face zero-shot classifier](https://github.com/huggingface/transformers) for suggestion annotations classes for highlighted sentences
-   Backend ([repository](https://gitlab.com/TIBHannover/orkg/orkg-backend))

# Components and hooks

Below, we describe the components in this directory briefly.

```
.
├── hooks
│   ├── useDeleteAnnotation.js (for the deletion confirmation popup)
│   ├── useEditAnnotation.js (edit the text of an annotation)
│   ├── useOntology.js (contains DEO ontology classes)
│   ├── useSuggestions.js (for rendering the zero-shot classifier suggestions)
├── AnnotationCategory.js (lists all annotations per class; max sentence warning)
├── AnnotationTooltipExisting.js (shows popup of existing annotation)
├── AnnotationTooltipNew.js (popup for new annotations; DEO class selector)
├── DragUpload.js (PDF file uploader, supports drag and drop)
├── EditAnnotationTextModal.js (model to edit annotation text)
├── Help.js (contains the welcome help tour, explaining the UI)
├── Highlight.js (rendering of highlight in text, determines the color)
├── ProgressBar.js (completion indicator for recommended DEO classes)
├── Save.js (for saving papers in the graph, create triples)
├── SideBar.js (shows completion bar; lists all annotations)
├── SmartSentenceDetection.js (highlights sentences from the abstract generator)
├── ZoomBar.js (PDF zoom control)
├── ../slices/pdfTextAnnotationSlices.js (Redux toolkit slices)
├── ../pages/PdfTextAnnotation.js (entry page of annotation tool; PDF renderer)
```

## Additional files

Not all files for the PDF annotator are listed in this folder. First, [the entry point component](https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/blob/43a6f01794b4da6e99b3a83f50db14ab33a39b9f/src/pages/PdfTextAnnotation.js) is the page that the user visits to start with annotating articles. Also, A Redux toolkit related file is relevant. The PdfTextAnnotationSlice file contains the Redux actions and reducer.
