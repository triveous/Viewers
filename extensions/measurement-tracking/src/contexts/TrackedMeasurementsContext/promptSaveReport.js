import { createReportAsync, createReportDialogPrompt } from '@ohif/extension-default';
import getNextSRSeriesNumber from '../../_shared/getNextSRSeriesNumber';
import RESPONSE from '../../_shared/PROMPT_RESPONSES';

function promptSaveReport({ servicesManager, commandsManager, extensionManager }, ctx, evt) {
  const { uiDialogService, measurementService, displaySetService } = servicesManager.services;
  const viewportId = evt.viewportId === undefined ? evt.data.viewportId : evt.viewportId;
  const isBackupSave = evt.isBackupSave === undefined ? evt.data.isBackupSave : evt.isBackupSave;
  const StudyInstanceUID = evt?.data?.StudyInstanceUID;
  const SeriesInstanceUID = evt?.data?.SeriesInstanceUID;

  const { trackedStudy, trackedSeries } = ctx;
  let displaySetInstanceUIDs;

  return new Promise(async function (resolve, reject) {
    const userJson = localStorage.getItem('ohif-viewer-user-details');
    const user = userJson ? JSON.parse(userJson) : null;
    console.log("user---------", user);

    const receivedData = JSON.parse(sessionStorage.getItem('popupData'));
    console.log('Received data in popup-------', receivedData, JSON.parse(receivedData));


    // TODO: Fallback if (uiDialogService) {
    const promptResult = await createReportDialogPrompt(uiDialogService, {
      extensionManager,
    });

    if (promptResult.action === RESPONSE.CREATE_REPORT) {
      const dataSources = extensionManager.getDataSources();
      const dataSource = dataSources[0];
      const measurements = measurementService.getMeasurements();
      const trackedMeasurements = measurements.filter(
        m => trackedStudy === m.referenceStudyUID && trackedSeries.includes(m.referenceSeriesUID)
      );

      const SeriesDescription =
        // isUndefinedOrEmpty
        promptResult.value === undefined || promptResult.value === ''
          ? 'Research Derived Series' // default
          : promptResult.value; // provided value

      const SeriesNumber = getNextSRSeriesNumber(displaySetService);

      const getReport = async () => {
        return commandsManager.runCommand(
          'storeMeasurements',
          {
            measurementData: trackedMeasurements,
            dataSource,
            additionalFindingTypes: ['ArrowAnnotate'],
            options: {
              SeriesDescription,
              SeriesNumber,
            },
            user : user
          },
          'CORNERSTONE_STRUCTURED_REPORT'
        );
      };
      displaySetInstanceUIDs = await createReportAsync({
        servicesManager,
        getReport,
      });
    } else if (promptResult.action === RESPONSE.CANCEL) {
      // Do nothing
    }

    resolve({
      userResponse: promptResult.action,
      createdDisplaySetInstanceUIDs: displaySetInstanceUIDs,
      StudyInstanceUID,
      SeriesInstanceUID,
      viewportId,
      isBackupSave,
    });
  });
}

export default promptSaveReport;
