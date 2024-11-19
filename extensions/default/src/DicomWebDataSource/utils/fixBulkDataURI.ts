/**
 * Modifies a bulkDataURI to ensure it is absolute based on the DICOMWeb configuration and
 * instance data. The modification is in-place.
 *
 * If the bulkDataURI is relative to the series or study (according to the DICOM standard),
 * it is made absolute by prepending the relevant paths.
 *
 * In scenarios where the bulkDataURI is a server-relative path (starting with '/'), the function
 * handles two cases:
 *
 * 1. If the wado root is absolute (starts with 'http'), it prepends the wado root to the bulkDataURI.
 * 2. If the wado root is relative, no changes are needed as the bulkDataURI is already correctly relative to the server root.
 *
 * @param value - The object containing BulkDataURI to be fixed.
 * @param instance - The object (DICOM instance data) containing StudyInstanceUID and SeriesInstanceUID.
 * @param dicomWebConfig - The DICOMWeb configuration object, containing wadoRoot and potentially bulkDataURI.relativeResolution.
 * @returns The function modifies `value` in-place, it does not return a value.
 */
function fixBulkDataURI(value, instance, dicomWebConfig) {
  // First, handle case where bulkDataURI is a full URL that needs host replacement
  console.log('------dicomWebConfig, value : line 21---', dicomWebConfig, value);
  if (value.BulkDataURI.startsWith('http')) {
    // Parse the wadoRoot to get the desired host
    const wadoUrl = new URL(dicomWebConfig.wadoRoot);
    // Parse the current bulkDataURI
    const currentUrl = new URL(value.BulkDataURI);
    console.log('------wadoUrl, currentUrl : line 21---', wadoUrl, currentUrl);
    // Replace the host but keep the path
    value.BulkDataURI = `${wadoUrl.origin}/dcm4chee-arc/aets/DCM4CHEE/rs/${currentUrl.pathname}`;
    return;
  }

  // Handle relative paths
  if (!value.BulkDataURI.startsWith('/')) {
    if (dicomWebConfig.bulkDataURI?.relativeResolution === 'studies') {
      value.BulkDataURI = `${dicomWebConfig.wadoRoot}/studies/${instance.StudyInstanceUID}/${value.BulkDataURI}`;
    } else if (
      dicomWebConfig.bulkDataURI?.relativeResolution === 'series' ||
      !dicomWebConfig.bulkDataURI?.relativeResolution
    ) {
      value.BulkDataURI = `${dicomWebConfig.wadoRoot}/studies/${instance.StudyInstanceUID}/series/${instance.SeriesInstanceUID}/${value.BulkDataURI}`;
    }
    return;
  }

  // Handle paths that start with '/'
  if (value.BulkDataURI[0] === '/') {
    if (dicomWebConfig.wadoRoot.startsWith('http')) {
      const url = new URL(dicomWebConfig.wadoRoot);
      value.BulkDataURI = `${url.origin}${value.BulkDataURI}`;
    }
    // For relative wado root, we don't need to do anything
  }
}

export { fixBulkDataURI };
