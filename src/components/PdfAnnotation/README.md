# Crowdsourcing Scholarly Discourse Annotations

_This code and document are part of the paper "Crowdsourcing Scholarly Discourse Annotations"_

This directory contains the User Interface (UI) elements for the annotation tool. The code itself should be understandable without a detailed explanation. This readme file briefly explains the code by listing the dependencies and the components.

# Dependencies, libraries and services

The code has multiple dependencies, the most important ones are listed below (for a full list of frontend dependencies, see the `package.json` file).

-   Frontend (this repository)
    -   [React](https://reactjs.org/) as frontend library
    -   [Next.js](https://nextjs.org/) as React framework
    -   [Redux Toolkit](https://redux-toolkit.js.org/) for state management
    -   [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for in-browser rendering of PDF files
    -   [React PDF Highlighter](https://github.com/agentcooper/react-pdf-highlighter) for highlighting sentences within PDF files (forked)
    -   [React dropzone](https://github.com/react-dropzone/react-dropzone) support for drag and drop file upload
    -   [Handsontable](https://handsontable.com/) for table editing functionality
    -   [Discourse Elements Ontology](http://purl.org/spar/deo) for the annotation classes list
    -   [Lodash](https://lodash.com/) for utility functions
    -   [SWR](https://swr.vercel.app/) for data fetching
-   Python support service ([repository](https://gitlab.com/TIBHannover/orkg/annotation/-/blob/36e14445c0a1a08701fc9762ba91b78da9e498ae/annotator/views.py))
    -   [Bert Extractive Summarizer](https://github.com/dmmiller612/bert-extractive-summarizer/) for generating abstracts from uploaded articles. The sentences from the generated abstract are displayed as highlights in the text
    -   [Hugging Face zero-shot classifier](https://github.com/huggingface/transformers) for suggestion annotations classes for highlighted sentences
-   Backend ([repository](https://gitlab.com/TIBHannover/orkg/orkg-backend))

# Components and hooks

Below, we describe the components in this directory briefly.

```
.
├── hooks/
│   ├── useDeleteAnnotation.ts (hook for deleting annotations)
│   ├── useEditAnnotation.tsx (edit the text of an annotation)
│   ├── useExtractionModal.tsx (manages table extraction modal state and data)
│   ├── useOntology.ts (contains DEO ontology classes)
│   ├── useSuggestions.ts (for rendering the zero-shot classifier suggestions)
│   └── useTableEditor.ts (manages table editing operations and state)
├── AnnotationCategory.tsx (lists all annotations per class; max sentence warning)
├── AnnotationTooltipExisting.tsx (shows popup of existing annotation)
├── AnnotationTooltipNew.tsx (popup for new annotations; DEO class selector)
├── ColumnOption.tsx (renders column options for table extraction)
├── CustomAreaHighlight.tsx (custom highlight component for PDF areas)
├── DragUpload.tsx (PDF file uploader, supports drag and drop)
├── EditAnnotationTextModal.tsx (modal to edit annotation text)
├── EditorComponent.tsx (custom editor component for table cells)
├── ExtractionModal.tsx (modal for extracting content from PDF)
├── ExtractReferencesModal.tsx (modal for extracting and mapping references from tables)
├── Help.tsx (contains the welcome help tour, explaining the UI)
├── Highlight.tsx (rendering of highlight in text, determines the color)
├── ProgressBar.tsx (completion indicator for recommended DEO classes)
├── RendererComponent.tsx (custom renderer component for table cells)
├── Save.tsx (for saving papers in the graph, create triples)
├── SideBar.tsx (shows completion bar; lists all annotations)
├── SmartSentenceDetection.jsx (highlights sentences from the abstract generator)
├── StablePopup.tsx (stable popup component for annotations)
├── TableEditor.tsx (main table editing interface using Handsontable)
├── ZoomBar.jsx (PDF zoom control)
├── helpers.ts (utility functions for table and reference processing)
├── types.ts (TypeScript type definitions)
├── ../slices/pdfAnnotationSlice.ts (Redux toolkit slice)
└── ../app/pdf-annotation/page.tsx (entry page of annotation tool; PDF renderer)
```

## Additional files

Not all files for the PDF annotator are listed in this folder. First, [the entry point component](https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/blob/master/src/app/pdf-annotation/page.jsx) is the page that the user visits to start with annotating articles. Also, a Redux toolkit related file is relevant. The PdfAnnotationSlice file contains the Redux actions and reducer.
