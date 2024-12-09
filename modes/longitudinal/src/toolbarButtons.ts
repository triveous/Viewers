// TODO: torn, can either bake this here; or have to create a whole new button type
// Only ways that you can pass in a custom React component for render :l
import { ToolbarService } from '@ohif/core';
import type { Button } from '@ohif/core/types';

const { createButton } = ToolbarService;

export const setToolActiveToolbar = {
  commandName: 'setToolActiveToolbar',
  commandOptions: {
    toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'],
  },
};

const toolbarButtons: Button[] = [
  {
    id: 'MeasurementTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'MeasurementTools',
      // group evaluate to determine which item should move to the top
      evaluate: 'evaluate.group.promoteToPrimaryIfCornerstoneToolNotActiveInTheList',
      primary: createButton({
        id: 'Length',
        icon: 'tool-length',
        label: 'Length',
        tooltip: 'Length Tool',
        commands: setToolActiveToolbar,
        evaluate: 'evaluate.cornerstoneTool',
      }),
      secondary: {
        icon: 'chevron-down',
        tooltip: 'More Measure Tools',
      },
      items: [
        createButton({
          id: 'Length',
          icon: 'tool-length',
          label: 'Length',
          tooltip: 'Length Tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'Bidirectional',
          icon: 'tool-bidirectional',
          label: 'Bidirectional',
          tooltip: 'Bidirectional Tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'ArrowAnnotate',
          icon: 'tool-annotate',
          label: 'Annotation',
          tooltip: 'Arrow Annotate',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'EllipticalROI',
          icon: 'tool-ellipse',
          label: 'Ellipse',
          tooltip: 'Ellipse ROI',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'RectangleROI',
          icon: 'tool-rectangle',
          label: 'Rectangle',
          tooltip: 'Rectangle ROI',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'CircleROI',
          icon: 'tool-circle',
          label: 'Circle',
          tooltip: 'Circle Tool',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        createButton({
          id: 'PlanarFreehandROI',
          icon: 'icon-tool-freehand-roi',
          label: 'Freehand ROI',
          tooltip: 'Freehand ROI',
          commands: setToolActiveToolbar,
          evaluate: 'evaluate.cornerstoneTool',
        }),
        // createButton({
        //   id: 'SplineROI',
        //   icon: 'icon-tool-spline-roi',
        //   label: 'Spline ROI',
        //   tooltip: 'Spline ROI',
        //   commands: setToolActiveToolbar,
        //   evaluate: 'evaluate.cornerstoneTool',
        // }),
        // createButton({
        //   id: 'LivewireContour',
        //   icon: 'icon-tool-livewire',
        //   label: 'Livewire tool',
        //   tooltip: 'Livewire tool',
        //   commands: setToolActiveToolbar,
        //   evaluate: 'evaluate.cornerstoneTool',
        // }),
      ],
    },
  },

  {
    id: 'LengthTool',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-length',
      label: 'length',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'Length',
          },
          context: 'CORNERSTONE',
        },
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'SRLength',
            toolGroupId: 'SRToolGroup',
          },
          context: 'CORNERSTONE',
        },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },

  {
    id: 'PlanarFreehandROI',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'icon-tool-freehand-roi',
      label: 'Freehand ROI',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'PlanarFreehandROI',
          },
          context: 'CORNERSTONE',
        },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },

  {
    id: 'bidirectionalTool',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-bidirectional',
      label: 'Bi-directional',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'Bidirectional',
          },
          context: 'CORNERSTONE',
        },
        // {
        //   commandName: 'setToolActive',
        //   commandOptions: {
        //     toolName: 'SRBidirectional',
        //     toolGroupId: 'SRToolGroup',
        //   },
        //   context: 'CORNERSTONE',
        // },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // Arrow Annotated measurement Tool
  {
    id: 'ArrowAnnotationTool',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-annotate',
      label: 'Annotation',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'ArrowAnnotate',
          },
          context: 'CORNERSTONE',
        },
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'SRArrowAnnotate',
            toolGroupId: 'SRToolGroup',
          },
          context: 'CORNERSTONE',
        },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // ellipse measurement Tool
  {
    id: 'ellipseTool',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-ellipse',
      label: 'Elipse',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'EllipticalROI',
          },
          context: 'CORNERSTONE',
        },
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'SREllipticalROI',
            toolGroupId: 'SRToolGroup',
          },
          context: 'CORNERSTONE',
        },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // circle measurement Tool
  {
    id: 'circleTool',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-circle',
      label: 'Circle',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'CircleROI',
          },
          context: 'CORNERSTONE',
        },
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'SRCircleROI',
            toolGroupId: 'SRToolGroup',
          },
          context: 'CORNERSTONE',
        },
      ],
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // Pan...
  {
    id: 'Pan',
    uiType: 'ohif.radioGroup',
    props: {
      type: 'tool',
      icon: 'tool-move',
      label: 'Pan',
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // {
  //   id: 'TrackballRotate',
  //   uiType: 'ohif.radioGroup',
  //   props: {
  //     type: 'tool',
  //     icon: 'tool-3d-rotate',
  //     label: '3D Rotate',
  //     commands: setToolActiveToolbar,
  //     evaluate: {
  //       name: 'evaluate.cornerstoneTool',
  //       disabledText: 'Select a 3D viewport to enable this tool',
  //     },
  //   },
  // },
  // {
  //   id: 'Capture',
  //   uiType: 'ohif.radioGroup',
  //   props: {
  //     icon: 'tool-capture',
  //     label: 'Capture',
  //     commands: 'showDownloadViewportModal',
  //     evaluate: [
  //       'evaluate.action',
  //       {
  //         name: 'evaluate.viewport.supported',
  //         unsupportedViewportTypes: ['video', 'wholeSlide'],
  //       },
  //     ],
  //   },
  // },
  // {
  //   id: 'Layout',
  //   uiType: 'ohif.layoutSelector',
  //   props: {
  //     rows: 3,
  //     columns: 4,
  //     evaluate: 'evaluate.action',
  //   },
  // },
  // {
  //   id: 'Crosshairs',
  //   uiType: 'ohif.radioGroup',
  //   props: {
  //     type: 'tool',
  //     icon: 'tool-crosshair',
  //     label: 'Crosshairs',
  //     commands: {
  //       commandName: 'setToolActiveToolbar',
  //       commandOptions: {
  //         toolGroupIds: ['mpr'],
  //       },
  //     },
  //     evaluate: {
  //       name: 'evaluate.cornerstoneTool',
  //       disabledText: 'Select an MPR viewport to enable this tool',
  //     },
  //   },
  // },
];

export default toolbarButtons;
