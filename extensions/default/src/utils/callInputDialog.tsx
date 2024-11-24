import React, { useEffect, useState } from 'react';
import { Input, Dialog, ButtonEnums, LabellingFlow, ProgressLoadingBar, Icon } from '@ohif/ui';

/**
 *
 * @param {*} data
 * @param {*} data.text
 * @param {*} data.label
 * @param {*} event
 * @param {*} callback
 * @param {*} isArrowAnnotateInputDialog
 * @param {*} dialogConfig
 * @param {string?} dialogConfig.dialogTitle - title of the input dialog
 * @param {string?} dialogConfig.inputLabel - show label above the input
 */

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
          `https://advisory.midas.iisc.ac.in/be/public/ontology?searchTerm=${searchTerm}&page=1&pageSize=20`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        // setLoading(false);
        const data = await response.json();
        setData(data.concept);

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
          labelClassName="text-black grow text-[14px] leading-[1.2] bg-white"
          autoFocus
          id="annotation"
          className="border-primary-main bg-white text-black"
          type="text"
          value={searchTerm}
          onChange={e => handleChange(e)}
          label={undefined} onFocus={undefined} onKeyPress={undefined}
          onKeyDown={undefined} readOnly={undefined} disabled={undefined}
          labelChildren={undefined}       />
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

export function callInputDialog(
  uiDialogService,
  data,
  callback,
  isArrowAnnotateInputDialog = true,
  dialogConfig: any = {}
) {
  const dialogId = 'dialog-enter-annotation';
  const label = data ? (isArrowAnnotateInputDialog ? data.text : data.label) : '';
  const {
    dialogTitle = 'Annotation',
    inputLabel = 'Enter your annotation',
    validateFunc = value => true,
  } = dialogConfig;

  const onSubmitHandler = ({ action, value }) => {
    switch (action.id) {
      case 'save':
        if (typeof validateFunc === 'function' && !validateFunc(value.label)) {
          return;
        }

        callback(value.label, action.id);
        break;
      case 'cancel':
        callback('', action.id);
        break;
    }
    uiDialogService.dismiss({ id: dialogId });
  };

  if (uiDialogService) {
    uiDialogService.create({
      id: dialogId,
      centralize: true,
      isDraggable: false,
      showOverlay: true,
      content: Dialog,
      contentProps: {
        title: dialogTitle,
        value: { label },
        noCloseButton: true,
        onClose: () => uiDialogService.dismiss({ id: dialogId }),
        actions: [
          { id: 'cancel', text: 'Cancel', type: ButtonEnums.type.secondary },
          { id: 'save', text: 'Save', type: ButtonEnums.type.primary },
        ],
        onSubmit: onSubmitHandler,
        body: ({ value, setValue }) => {
          return (
            <Input
              autoFocus
              className="border-primary-main bg-white"
              type="text"
              id="annotation"
              label={inputLabel}
              labelClassName="text-white text-[14px] leading-[1.2]"
              value={value.label}
              onChange={event => {
                event.persist();
                setValue(value => ({ ...value, label: event.target.value }));
              }}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  onSubmitHandler({ value, action: { id: 'save' } });
                }
              }}
            />
          );
        },
      },
    });
  }
}

export function callLabelAutocompleteDialog(uiDialogService, callback, dialogConfig, labelConfig) {
  const exclusive = labelConfig ? labelConfig.exclusive : false;
  const dropDownItems = labelConfig ? labelConfig.items : [];

  const { validateFunc = value => true } = dialogConfig;

  const labellingDoneCallback = value => {
    if (typeof value === 'string') {
      if (typeof validateFunc === 'function' && !validateFunc(value)) {
        return;
      }
      callback(value, 'save');
    } else {
      callback('', 'cancel');
    }
    uiDialogService.dismiss({ id: 'select-annotation' });
  };

  uiDialogService.create({
    id: 'select-annotation',
    centralize: true,
    isDraggable: false,
    showOverlay: true,
    content: LabellingFlow,
    contentProps: {
      labellingDoneCallback: labellingDoneCallback,
      measurementData: { label: '' },
      componentClassName: {},
      labelData: dropDownItems,
      exclusive: exclusive,
    },
  });
}

export function showLabelAnnotationPopup(measurement, uiDialogService) {
  return new Promise((resolve, reject) => {
    const onSubmitHandler = ({ action, value }) => {
      uiDialogService.dismiss({ id: 'enter-annotation' });
      console.log('-----value', action, value);
      if (action.text === 'Save' ) {
        measurement.label = value.label;
        resolve(measurement);
      } else {
        reject(new Error('Action canceled or invalid input'));
      }
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
          label: measurement?.findingSites?.[0]?.text || '',
          description: measurement?.findingSites?.[0]?.text || '',
        },
        body: ({ value, setValue }) => {
          return (
            <div className="flex w-[400px] flex-col gap-5">
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
  });
}


export default callInputDialog;
