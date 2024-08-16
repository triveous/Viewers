import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  StudySummary,
  MeasurementTable,
  Dialog,
  Input,
  useViewportGrid,
  ButtonEnums,
  Icon,
  ProgressLoadingBar,
} from '@ohif/ui';
import { DicomMetadataStore, utils } from '@ohif/core';
import { useDebounce } from '@hooks';
import ActionButtons from './ActionButtons';
import { useTrackedMeasurements } from '../../getContextModule';
import debounce from 'lodash.debounce';

const { downloadCSVReport } = utils;
const { formatDate } = utils;

const changeStatus = async (
  url: string,
  token: any,
  taskId: string,
  userId: string,
  action: string
) => {
  try {
    const response = await fetch(
      `${url}/contributor/be/patient/record/assign/user/${userId}?action=${action}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      }
    );

    if (response.status == 404) {
      console.error('-----no data found------', response.status);
      return response.json();
    }
    if (response.status !== 202) {
      throw new Error('Failed to post data');
    }
    return response.json();
  } catch (error) {
    console.error('Error posting data:', error);
    throw new Error('Failed to post data');
  }
};

const DISPLAY_STUDY_SUMMARY_INITIAL_VALUE = {
  key: undefined, //
  date: '', // '07-Sep-2010',
  modality: '', // 'CT',
  description: '', // 'CHEST/ABD/PELVIS W CONTRAST',
};
const SearchBar = ({ onSelectHandler }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const delay = 500;
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (debouncedSearchTerm == '') {
          setActive(false);
          return;
        }
        // setLoading(true);
        const response = await fetch(
          `https://tx.fhir.org/r4/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs&filter=${searchTerm}&_format=application%2Fjson&count=7`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        // setLoading(false);
        const data = await response.json();
        setData(data.expansion.contains);

        setActive(true);
      } catch (error) {
        console.error('API call failed:', error.message);
      }
    };

    if (debouncedSearchTerm.length > 0) {
      fetchData();
    } else {
      setActive(false);
      setData([]);
    }
  }, [debouncedSearchTerm, onSelectHandler]);

  const handleChange = e => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="h-[100%] w-full">
      <div className="h-[100%] w-full">
        <Input
          label="Enter your label"
          labelClassName="text-black grow text-[14px] leading-[1.2] bg-white"
          autoFocus
          id="annotation"
          className="border-primary-main bg-white text-black"
          type="text"
          value={searchTerm}
          onChange={e => handleChange(e)}
        />
      </div>
      {active && (
        <div className="max-h-[250px] min-h-[52px] w-full overflow-y-auto ">
          {loading ? (
            <LoadingBar />
          ) : (
            data &&
            data?.map((item, index) => {
              return (
                <div
                  className="border- p-2 text-sm text-black hover:bg-[#DBDBDA] focus:bg-[#DBDBDA]"
                  key={index}
                  onClick={e => {
                    setActive(false);
                    setSearchTerm(item.display);
                    setData([]);
                    onSelectHandler(e, item);
                  }}
                >
                  <div className="whitespace-normal break-words">{item.display}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const LoadingBar = () => {
  return (
    <div className={' flex flex-col items-center justify-center space-y-5'}>
      <Icon
        name="loading-ohif-mark"
        className="h-12 w-12 text-white"
      />
      <div className="w-48">
        <ProgressLoadingBar />
      </div>
    </div>
  );
};

function PanelMeasurementTableTracking({ servicesManager, extensionManager }) {
  const [viewportGrid] = useViewportGrid();
  const [measurementChangeTimestamp, setMeasurementsUpdated] = useState(Date.now().toString());
  const debouncedMeasurementChangeTimestamp = useDebounce(measurementChangeTimestamp, 200);
  const { measurementService, uiDialogService, displaySetService } = servicesManager.services;
  const [trackedMeasurements, sendTrackedMeasurementsEvent] = useTrackedMeasurements();
  const { trackedStudy, trackedSeries } = trackedMeasurements.context;
  const [displayStudySummary, setDisplayStudySummary] = useState(
    DISPLAY_STUDY_SUMMARY_INITIAL_VALUE
  );
  const [displayMeasurements, setDisplayMeasurements] = useState([]);
  const measurementsPanelRef = useRef(null);
  const [measurementUpdated, setMeasurementUpdated] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  // useEffect(() => {
  //   setReadOnly(JSON.parse(localStorage.getItem('readOnly')).readOnly);
  // }, []);
  useEffect(() => {
    if (false && JSON.parse(localStorage.getItem('readOnly'))) {
      setReadOnly(JSON.parse(localStorage.getItem('readOnly'))?.readOnly);
    } else {
      console.log('we are in false....b');
    }
  }, []);
  useEffect(() => {
    const measurements = measurementService.getMeasurements();
    const filteredMeasurements = measurements.filter(
      m => trackedStudy === m.referenceStudyUID && trackedSeries.includes(m.referenceSeriesUID)
    );

    const mappedMeasurements = filteredMeasurements.map(m =>
      _mapMeasurementToDisplay(m, measurementService.VALUE_TYPES, displaySetService)
    );
    setDisplayMeasurements(mappedMeasurements);
    // eslint-ignore-next-line
  }, [
    measurementUpdated,
    measurementService,
    trackedStudy,
    trackedSeries,
    debouncedMeasurementChangeTimestamp,
  ]);

  const updateDisplayStudySummary = async () => {
    if (trackedMeasurements.matches('tracking')) {
      const StudyInstanceUID = trackedStudy;
      const studyMeta = DicomMetadataStore.getStudy(StudyInstanceUID);
      const instanceMeta = studyMeta.series[0].instances[0];
      const { StudyDate, StudyDescription } = instanceMeta;

      const modalities = new Set();
      studyMeta.series.forEach(series => {
        if (trackedSeries.includes(series.SeriesInstanceUID)) {
          modalities.add(series.instances[0].Modality);
        }
      });
      const modality = Array.from(modalities).join('/');

      if (displayStudySummary.key !== StudyInstanceUID) {
        setDisplayStudySummary({
          key: StudyInstanceUID,
          date: StudyDate, // TODO: Format: '07-Sep-2010'
          modality,
          description: StudyDescription,
        });
      }
    } else if (trackedStudy === '' || trackedStudy === undefined) {
      setDisplayStudySummary(DISPLAY_STUDY_SUMMARY_INITIAL_VALUE);
    }
  };

  // ~~ DisplayStudySummary
  useEffect(() => {
    updateDisplayStudySummary();
  }, [displayStudySummary.key, trackedMeasurements, trackedStudy, updateDisplayStudySummary]);

  // TODO: Better way to consolidated, debounce, check on change?
  // Are we exposing the right API for measurementService?
  // This watches for ALL measurementService changes. It updates a timestamp,
  // which is debounced. After a brief period of inactivity, this triggers
  // a re-render where we grab up-to-date measurements
  useEffect(() => {
    const added = measurementService.EVENTS.MEASUREMENT_ADDED;
    const addedRaw = measurementService.EVENTS.RAW_MEASUREMENT_ADDED;
    const updated = measurementService.EVENTS.MEASUREMENT_UPDATED;
    const removed = measurementService.EVENTS.MEASUREMENT_REMOVED;
    const cleared = measurementService.EVENTS.MEASUREMENTS_CLEARED;
    const subscriptions = [];

    [added, addedRaw, updated, removed, cleared].forEach(evt => {
      subscriptions.push(
        measurementService.subscribe(evt, () => {
          setMeasurementsUpdated(Date.now().toString());
          if (evt === added) {
            debounce(() => {
              measurementsPanelRef.current.scrollTop = measurementsPanelRef.current.scrollHeight;
            }, 300)();
          }
        }).unsubscribe
      );
    });

    return () => {
      subscriptions.forEach(unsub => {
        unsub();
      });
    };
  }, [measurementService, sendTrackedMeasurementsEvent]);

  async function exportReport() {
    const measurements = measurementService.getMeasurements();
    const trackedMeasurements = measurements.filter(
      m => trackedStudy === m.referenceStudyUID && trackedSeries.includes(m.referenceSeriesUID)
    );

    downloadCSVReport(trackedMeasurements, measurementService);
  }

  const jumpToImage = ({ uid, isActive }) => {
    measurementService.jumpToMeasurement(viewportGrid.activeViewportId, uid);

    onMeasurementItemClickHandler({ uid, isActive });
  };

  const onMeasurementItemEditHandler = ({ uid, isActive }) => {
    const measurement = measurementService.getMeasurement(uid);
    jumpToImage({ uid, isActive });

    const onSubmitHandler = ({ action, value }) => {
      switch (action.id) {
        case 'save': {
          if (measurement.findingSites) {
            measurement.findingSites[0].CodeMeaning = value.description;
            measurement.findingSites[0].text = value.description;
          } else {
            measurement.findingSites = [
              {
                CodeValue: 'CORNERSTONEFREETEXT',
                CodingSchemeDesignator: 'CORNERSTONEJS',
                CodeMeaning: value.description,
                text: value.description,
              },
            ];
          }
          measurementService.update(
            uid,
            {
              ...measurement,
              ...value,
            },
            true
          );
          setMeasurementUpdated(!measurementUpdated);
        }
      }
      uiDialogService.dismiss({ id: 'enter-annotation' });
    };

    uiDialogService.create({
      id: 'enter-annotation',
      centralize: true,
      isDraggable: false,
      showOverlay: true,
      content: Dialog,
      contentProps: {
        title: 'Add Ontology',
        noCloseButton: true,
        value: {
          label: measurement.label || '',
          description: measurement?.findingSites?.[0]?.text || '',
        },
        body: ({ value, setValue }) => {
          return (
            <div className="flex w-full flex-col gap-5">
              <SearchBar
                onSelectHandler={(e, selected) => {
                  e.persist();
                  setValue({ label: selected.display, description: selected.display });
                }}
              />
            </div>
          );
        },
        actions: [
          { id: 'cancel', text: 'Cancel', type: ButtonEnums.type.secondary },
          { id: 'save', text: 'Save', type: ButtonEnums.type.primary },
        ],
        onSubmit: onSubmitHandler,
      },
    });
  };

  const onMeasurementItemDeleteHandler = ({ uid, isActive }) => {
    const measurement = measurementService.getMeasurement(uid);
    jumpToImage({ uid, isActive });

    const onSubmitHandler = ({ action, value }) => {
      switch (action.id) {
        case 'delete': {
          measurementService.remove(uid, 1, 2);
          break;
        }
        case 'cancel': {
          break;
        }
      }
      uiDialogService.dismiss({ id: 'delete-annotation' });
    };

    uiDialogService.create({
      id: 'delete-annotation',
      centralize: true,
      isDraggable: false,
      showOverlay: true,
      content: Dialog,
      contentProps: {
        title: 'Delete Measurement',
        noCloseButton: true,
        value: {
          label: measurement.label || '',
          description: measurement?.findingSites?.[0]?.text || '',
        },
        body: ({ value, setValue }) => {
          return (
            <div className="flex w-full flex-col gap-5 text-black">
              <div>Are you sure ?</div>
            </div>
          );
        },
        actions: [
          { id: 'cancel', text: 'Cancel', type: ButtonEnums.type.secondary },
          { id: 'delete', text: 'Delete', type: ButtonEnums.type.primary },
        ],
        onSubmit: onSubmitHandler,
      },
    });
  };

  const onMeasurementItemClickHandler = ({ uid, isActive }) => {
    if (!isActive) {
      const measurements = [...displayMeasurements];
      const measurement = measurements.find(m => m.uid === uid);

      measurements.forEach(m => (m.isActive = m.uid !== uid ? false : true));
      measurement.isActive = true;
      setDisplayMeasurements(measurements);
    }
  };

  const displayMeasurementsWithoutFindings = displayMeasurements.filter(
    dm => dm.measurementType !== measurementService.VALUE_TYPES.POINT
  );
  const additionalFindings = displayMeasurements.filter(
    dm => dm.measurementType === measurementService.VALUE_TYPES.POINT
  );

  return (
    <>
      <div
        className="invisible-scrollbar overflow-y-auto overflow-x-hidden"
        ref={measurementsPanelRef}
        data-cy={'trackedMeasurements-panel'}
      >
        {displayStudySummary.key && (
          <StudySummary
            date={formatDate(displayStudySummary.date)}
            modality={displayStudySummary.modality}
            description={displayStudySummary.description}
          />
        )}
        <MeasurementTable
          title="Annotations"
          data={[...displayMeasurementsWithoutFindings, ...additionalFindings]}
          servicesManager={servicesManager}
          onClick={jumpToImage}
          onEdit={onMeasurementItemEditHandler}
          onDelete={onMeasurementItemDeleteHandler}
        />
      </div>
      <div className="flex justify-center p-4">
        <ActionButtons
          onExportClick={exportReport}
          onCreateReportClick={async () => {
            // solution 1
            const dataJson = localStorage.getItem('ohif-viewer-user-details');
            const data = dataJson ? JSON.parse(dataJson) : null;
            console.log('----data----', data, dataJson);
            if (data) {
              await changeStatus(
                data.url,
                data.token,
                data.taskId,
                data.userId,
                'annotator_submitted'
              );
            }
            sendTrackedMeasurementsEvent('SAVE_REPORT', {
              viewportId: viewportGrid.activeViewportId,
              isBackupSave: true,
            });
          }}
          disabled={
            readOnly ||
            (additionalFindings.length === 0 && displayMeasurementsWithoutFindings.length === 0)
          }
        />
      </div>
    </>
  );
}

PanelMeasurementTableTracking.propTypes = {
  servicesManager: PropTypes.shape({
    services: PropTypes.shape({
      measurementService: PropTypes.shape({
        getMeasurements: PropTypes.func.isRequired,
        VALUE_TYPES: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

// TODO: This could be a measurementService mapper
function _mapMeasurementToDisplay(measurement, types, displaySetService) {
  const { referenceStudyUID, referenceSeriesUID, SOPInstanceUID } = measurement;

  // TODO: We don't deal with multiframe well yet, would need to update
  // This in OHIF-312 when we add FrameIndex to measurements.

  const instance = DicomMetadataStore.getInstance(
    referenceStudyUID,
    referenceSeriesUID,
    SOPInstanceUID
  );

  const displaySets = displaySetService.getDisplaySetsForSeries(referenceSeriesUID);

  if (!displaySets[0] || !displaySets[0].images) {
    throw new Error('The tracked measurements panel should only be tracking "stack" displaySets.');
  }

  const {
    displayText: baseDisplayText,
    uid,
    label: baseLabel,
    type,
    selected,
    findingSites,
    finding,
  } = measurement;

  const firstSite = findingSites?.[0];
  const label = baseLabel || finding?.text || firstSite?.text || '(empty)';
  let displayText = baseDisplayText || [];
  if (findingSites) {
    const siteText = [];
    findingSites.forEach(site => {
      siteText.push(site.text);
    });
    displayText = [...siteText];
  }
  // if (finding && finding?.text !== label) {
  //   displayText = [finding.text, ...displayText];
  // }

  return {
    uid,
    label,
    baseLabel,
    measurementType: type,
    displayText,
    baseDisplayText,
    isActive: selected,
    finding,
    findingSites,
  };
}

export default PanelMeasurementTableTracking;
