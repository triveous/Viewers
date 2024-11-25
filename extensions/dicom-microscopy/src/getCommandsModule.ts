import { ServicesManager, CommandsManager, ExtensionManager } from '@ohif/core';
import styles from './utils/styles';
import callInputDialog from './utils/callInputDialog';
import { adaptersSR } from '@cornerstonejs/adapters';  // or appropriate import

const { MeasurementReport } = adaptersSR.Cornerstone3D;

export default function getCommandsModule({
  servicesManager,
  commandsManager,
  extensionManager,
}: {
  servicesManager: ServicesManager;
  commandsManager: CommandsManager;
  extensionManager: ExtensionManager;
}) {
  const { viewportGridService, uiDialogService, microscopyService } = servicesManager.services;

  const actions = {


    /**
     * Store the measurements as a structured report in DICOM format
     * @param {Array} measurementData - List of measurements to be serialized
     * @param {Array} additionalFindingTypes - Additional findings for the report
     * @param {Object} options - Additional options for customizing the report
     * @param {Object} user - The user information (e.g., name and ID) to populate the report author field
     */
    storeMeasurements: async ({ measurementData, additionalFindingTypes, options = {}, user }) => {
      try {
        // Step 1: Filter the tool state based on measurement data and additional findings
        const filteredToolState = getFilteredCornerstoneToolState(
          measurementData,
          additionalFindingTypes
        );

        // Step 2: Generate the report using the filtered tool state, metadata, world-to-image coordinates, and options
        const report = MeasurementReport.generateReport(
          filteredToolState,
          metadata, // Assuming metadata is available somewhere
          utilities.worldToImageCoords,
          options
        );

        const { dataset } = report;

        // Step 3: Set the character set as UTF-8 if not already set
        if (typeof dataset.SpecificCharacterSet === 'undefined') {
          dataset.SpecificCharacterSet = 'ISO_IR 192';
        }

        // Step 4: Add user data to the report (if user is provided)
        if (user) {
          dataset.AuthorObserverSequence = [
            {
              PersonName: user.name,
              PersonIdentificationCodeSequence: [
                {
                  CodeValue: user.id,
                  CodingSchemeDesignator: '99LOCAL',
                },
              ],
              AuthorObserverTypeCodeSequence: [
                {
                  CodeValue: 'AUT',
                  CodingSchemeDesignator: 'DCM',
                  CodeMeaning: 'Author',
                },
              ],
            },
          ];
        }

        // Step 5: Convert the dataset to a Blob and store it
        const reportBlob = dcmjs.data.datasetToBlob(dataset);

        // Store the report using the appropriate dataSource method
        if (dataSource && dataSource.store && dataSource.store.dicom) {
          await dataSource.store.dicom(dataset);

          // Optionally clear study metadata or refresh the viewer
          const { StudyInstanceUID } = dataset;
          if (StudyInstanceUID) {
            dataSource.deleteStudyMetadataPromise(StudyInstanceUID);
          }
          DicomMetadataStore.addInstances([dataset], true);
        }

        return dataset;
      } catch (error) {
        console.error('Error storing measurements:', error);
        throw new Error('Failed to store measurements.');
      }
    },


    // Measurement tool commands:
    deleteMeasurement: ({ uid }) => {
      if (uid) {
        const roiAnnotation = microscopyService.getAnnotation(uid);
        if (roiAnnotation) {
          microscopyService.removeAnnotation(roiAnnotation);
        }
      }
    },

    setLabel: ({ uid }) => {
      const roiAnnotation = microscopyService.getAnnotation(uid);

      callInputDialog({
        uiDialogService,
        defaultValue: '',
        callback: (value: string, action: string) => {
          switch (action) {
            case 'save': {
              // console.log('----inside the case save----', value);
              roiAnnotation.setLabel(value);
              microscopyService.triggerRelabel(roiAnnotation);
            }
          }
        },
      });
    },

    setToolActive: ({ toolName, toolGroupId = 'MICROSCOPY' }) => {
      const dragPanOnMiddle = [
        'dragPan',
        {
          bindings: {
            mouseButtons: ['middle'],
          },
        },
      ];
      const dragZoomOnRight = [
        'dragZoom',
        {
          bindings: {
            mouseButtons: ['right'],
          },
        },
      ];
      if (
        ['line', 'box', 'circle', 'point', 'polygon', 'freehandpolygon', 'freehandline'].indexOf(
          toolName
        ) >= 0
      ) {
        // TODO: read from configuration
        const options = {
          geometryType: toolName,
          vertexEnabled: true,
          styleOptions: styles.default,
          bindings: {
            mouseButtons: ['left'],
          },
        } as any;
        if ('line' === toolName) {
          options.minPoints = 2;
          options.maxPoints = 2;
        } else if ('point' === toolName) {
          delete options.styleOptions;
          delete options.vertexEnabled;
        }

        microscopyService.activateInteractions([
          ['draw', options],
          dragPanOnMiddle,
          dragZoomOnRight,
        ]);
      } else if (toolName == 'dragPan') {
        microscopyService.activateInteractions([
          [
            'dragPan',
            {
              bindings: {
                mouseButtons: ['left', 'middle'],
              },
            },
          ],
          dragZoomOnRight,
        ]);
      } else {
        microscopyService.activateInteractions([
          [
            toolName,
            {
              bindings: {
                mouseButtons: ['left'],
              },
            },
          ],
          dragPanOnMiddle,
          dragZoomOnRight,
        ]);
      }
    },
    toggleOverlays: () => {
      // overlay
      const overlays = document.getElementsByClassName('microscopy-viewport-overlay');
      let onoff = false; // true if this will toggle on
      for (let i = 0; i < overlays.length; i++) {
        if (i === 0) {
          onoff = overlays.item(0).classList.contains('hidden');
        }
        overlays.item(i).classList.toggle('hidden');
      }

      // overview
      const { activeViewportId, viewports } = viewportGridService.getState();
      microscopyService.toggleOverviewMap(activeViewportId);
    },
    toggleAnnotations: () => {
      microscopyService.toggleROIsVisibility();
    },
  };

  const definitions = {
    deleteMeasurement: {
      commandFn: actions.deleteMeasurement,
      storeContexts: [] as any[],
      options: {},
    },
    setLabel: {
      commandFn: actions.setLabel,
      storeContexts: [] as any[],
      options: {},
    },
    setToolActive: {
      commandFn: actions.setToolActive,
      storeContexts: [] as any[],
      options: {},
    },
    toggleOverlays: {
      commandFn: actions.toggleOverlays,
      storeContexts: [] as any[],
      options: {},
    },
    toggleAnnotations: {
      commandFn: actions.toggleAnnotations,
      storeContexts: [] as any[],
      options: {},
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'MICROSCOPY',
  };
}
