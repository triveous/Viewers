import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from '../Icon';

const MeasurementItem = ({
  uid,
  index,
  label,
  displayText,
  isActive,
  onClick,
  onEdit,
  onDelete,
  item,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const onEditHandler = event => {
    event.stopPropagation();
    onEdit({ uid, isActive, event });
  };

  const onDeleteHandler = event => {
    event.stopPropagation();
    onDelete({ uid });
  };

  const onClickHandler = event => onClick({ uid, isActive, event });

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={classnames(
        'group flex w-[200px] cursor-pointer border border-transparent bg-white outline-none transition duration-300',
        {
          'border-primary-light overflow-hidden rounded': isActive,
        }
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClickHandler}
      role="button"
      tabIndex="0"
      data-cy={'measurement-item'}
    >
      <div
        className={classnames('w-6 py-1 text-center text-base transition duration-300', {
          'bg-primary-light active text-black': isActive,
          'bg-primary-dark text-primary-light group-hover:bg-secondary-main': !isActive,
        })}
      >
        {index}
      </div>
      <div className=" w-full bg-white p-2">
        <div className="relative flex w-full flex-1 flex-col px-2 py-1">
          <span className="text-black mb-1 w-full text-base ">{label}</span>
          {displayText.map((line, i) => (
            <span
              key={i}
              className="border-primary-light w-full whitespace-normal break-words  pl-2 text-base text-black"
              dangerouslySetInnerHTML={{ __html: line }}
            ></span>
          ))}
        </div>
        <div className="flex gap-2 pl-2 pt-2">
          <Icon
            className={classnames(' w-4 cursor-pointer text-black transition duration-300')}
            name="pencil"
            onClick={onEditHandler}
          />
          <Icon
            className={classnames(' w-4 cursor-pointer text-black transition duration-300')}
            name="old-trash"
            onClick={onDeleteHandler}
          />
        </div>
      </div>
    </div>
  );
};

MeasurementItem.propTypes = {
  uid: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
  index: PropTypes.number.isRequired,
  label: PropTypes.string,
  displayText: PropTypes.array.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

MeasurementItem.defaultProps = {
  isActive: false,
};

export default MeasurementItem;
