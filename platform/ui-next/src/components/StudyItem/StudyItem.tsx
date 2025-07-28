import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ThumbnailList } from '../ThumbnailList';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../Accordion';

const StudyItem = ({
  date,
  description,
  numInstances,
  modalities,
  isActive,
  onClick,
  isExpanded,
  displaySets,
  activeDisplaySetInstanceUIDs,
  onClickThumbnail,
  onDoubleClickThumbnail,
  onClickUntrack,
  viewPreset = 'thumbnails',
  onThumbnailContextMenu,
}: withAppTypes) => {
  if (!isActive) {
    return <></>;
  }
  return (
    <Accordion
      type="single"
      collapsible
      onClick={onClick}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
      defaultValue={isActive ? 'study-item' : undefined}
    >
      <AccordionItem value="study-item">
        <AccordionTrigger className={classnames('rounded bg-[#F5F8FF] py-4 hover:bg-[#F5F8FF]')}>
          <div className="flex h-[40px] flex-1 flex-row">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="flex flex-col items-start text-[13px]">
                <div className="text-md text-[#38476D]">{date}</div>
                <div className="text-md h-[18px] max-w-[160px] overflow-hidden truncate whitespace-nowrap text-[#38476D]">
                  {description}
                </div>
              </div>
              <div className="text-muted-foreground mr-2 flex flex-col items-end text-[12px]">
                <div className="max-w-[150px] overflow-hidden text-[#38476D]">{modalities}</div>
                <div>{numInstances}</div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent
          onClick={event => {
            event.stopPropagation();
          }}
        >
          {isExpanded && displaySets && (
            <ThumbnailList
              thumbnails={displaySets}
              activeDisplaySetInstanceUIDs={activeDisplaySetInstanceUIDs}
              onThumbnailClick={onClickThumbnail}
              onThumbnailDoubleClick={onDoubleClickThumbnail}
              onClickUntrack={onClickUntrack}
              viewPreset={viewPreset}
              onThumbnailContextMenu={onThumbnailContextMenu}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  trackedSeries: PropTypes.number,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  displaySets: PropTypes.array,
  activeDisplaySetInstanceUIDs: PropTypes.array,
  onClickThumbnail: PropTypes.func,
  onDoubleClickThumbnail: PropTypes.func,
  onClickUntrack: PropTypes.func,
  viewPreset: PropTypes.string,
};

export { StudyItem };
