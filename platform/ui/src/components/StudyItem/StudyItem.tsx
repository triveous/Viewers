import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from '../Icon';

const baseClasses =
  'first:border-0 border-t border-secondary-light cursor-pointer select-none outline-none';

const StudyItem = ({
  date,
  description,
  numInstances,
  modalities,
  trackedSeries,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={classnames(
        isActive ? 'bg-secondary-dark' : 'hover:bg-secondary-main bg-black',
        baseClasses
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex="0"
    >
      <div className="flex flex-1 flex-col bg-[#F5F8FF] px-4 pb-2">
        <div className="flex flex-row items-center justify-between pt-2 pb-2">
          <div className="text-base text-black">{date}</div>
          <div className="flex flex-row items-center bg-[#F5F8FF] text-base text-[#38476D]">
            <Icon
              name="group-layers"
              className="mx-2 w-4 text-[#38476D]"
            />
            {numInstances}
          </div>
        </div>
        <div className="flex flex-row py-1">
          <div className="pr-5 text-xl text-[#38476D]">{modalities}</div>
          <div className="truncate-2-lines break-words text-base text-[#38476D]">{description}</div>
        </div>
      </div>
      {/* {!!trackedSeries && (
        <div className="flex-2 flex">
          <div
            className={classnames(
              'bg-secondary-main mt-2 flex flex-row py-1 pl-2 pr-4 text-base text-black ',
              isActive
                ? 'border-secondary-light flex-1 justify-center border-t'
                : 'mx-4 mb-4 rounded-sm'
            )}
          >
            <Icon
              name="tracked"
              className="text-primary-light mr-2 w-4"
            />
            {trackedSeries} Tracked Series
          </div>
        </div>
      )} */}
    </div>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  trackedSeries: PropTypes.number,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default StudyItem;
