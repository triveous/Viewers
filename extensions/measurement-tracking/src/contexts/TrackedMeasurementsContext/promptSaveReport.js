import { createReportAsync } from '@ohif/extension-default';
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

    // Generate a unique SeriesDescription with timestamp
    const currentTimestamp = new Date().toISOString();
    const SeriesDescription = `Research Derived Series - ${currentTimestamp}`;

    const SeriesNumber = getNextSRSeriesNumber(displaySetService);

    const dataSources = extensionManager.getDataSources();
    const dataSource = dataSources[0];
    const measurements = measurementService.getMeasurements();
    const trackedMeasurements = measurements.filter(
      m => trackedStudy === m.referenceStudyUID && trackedSeries.includes(m.referenceSeriesUID)
    );

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
          user: user,
        },
        'CORNERSTONE_STRUCTURED_REPORT'
      );
    };
    displaySetInstanceUIDs = await createReportAsync({
      servicesManager,
      getReport,
    });

    resolve({
      userResponse: RESPONSE.CREATE_REPORT,
      createdDisplaySetInstanceUIDs: displaySetInstanceUIDs,
      StudyInstanceUID,
      SeriesInstanceUID,
      viewportId,
      isBackupSave,
    });
  });
}

export default promptSaveReport;
