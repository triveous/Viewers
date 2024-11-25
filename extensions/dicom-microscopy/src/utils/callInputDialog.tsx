import React, { useEffect, useState } from 'react';
import { Input, Dialog, ButtonEnums, Icon, ProgressLoadingBar } from '@ohif/ui';

const SearchBar = ({ onSelectHandler }: any) => {
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
      <Icon name="loading-ohif-mark" className="h-12 w-12 text-white" />
      <div className="w-48">
        <ProgressLoadingBar />
      </div>
    </div>
  );
};

/**
 *
 * @param {*} data
 * @param {*} data.text
 * @param {*} data.label
 * @param {*} event
 * @param {func} callback
 * @param {*} isArrowAnnotateInputDialog
 */
export default function callInputDialog({
  uiDialogService,
  title = 'Annotation',
  defaultValue = '',
  callback = (value: string, action: string) => {},
}) {
  const dialogId = 'microscopy-input-dialog';

  const onSubmitHandler = ({ action, value }) => {
    switch (action.id) {
      case 'save':
        // console.log('------value, action : line 21---', value, action);
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
        title: title,
        value: { value: defaultValue },
        noCloseButton: true,
        onClose: () => uiDialogService.dismiss({ id: dialogId }),
        actions: [
          { id: 'cancel', text: 'Cancel', type: ButtonEnums.type.secondary },
          { id: 'save', text: 'Save', type: ButtonEnums.type.primary },
        ],
        onSubmit: onSubmitHandler,
        body: ({ value, setValue }) => {
          return (
            // <Input
            //   label="Add Ontology"
            //   labelClassName="text-white text-[14px] leading-[1.2]"
            //   autoFocus
            //   className="border-primary-main bg-black"
            //   type="text"
            //   value={value.defaultValue}
            //   onChange={event => {
            //     event.persist();
            //     setValue(value => ({ ...value, value: event.target.value }));
            //   }}
            //   onKeyPress={event => {
            //     if (event.key === 'Enter') {
            //       onSubmitHandler({ value, action: { id: 'save' } });
            //     }
            //   }}
            // />

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
      },
    });
  }
}
