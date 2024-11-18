import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Thumbnail from '../Thumbnail';
import ThumbnailNoImage from '../ThumbnailNoImage';
import ThumbnailTracked from '../ThumbnailTracked';
import * as Types from '../../types';

const ThumbnailList = ({
  thumbnails,
  onThumbnailClick,
  onThumbnailDoubleClick,
  onClickUntrack,
  activeDisplaySetInstanceUIDs = [],
  viewportId = 'cornerstone-viewport-element', // ID of your cornerstone viewport element
  maxRetries = 10
}) => {
  const [hasLoadedAnnotations, setHasLoadedAnnotations] = useState(false);
  const retryCount = useRef(0);
  const timeoutRef = useRef(null);

  const latestThumbnail = thumbnails
    .filter(thumb => thumb.modality === 'SR')
    .reduce(
      (max, current) => {
        return current.seriesNumber > max.seriesNumber ? current : max;
      },
      { seriesNumber: -Infinity }
    );
  const everythingExceptSRThmbnails = thumbnails.filter(thumb => thumb.modality !== 'SR');
  const updatedThumbnails = [...everythingExceptSRThmbnails];

  useEffect(() => {
    const handleImageRendered = (event) => {
      if (!hasLoadedAnnotations && latestThumbnail?.displaySetInstanceUID) {
        setTimeout(() => {
          onThumbnailDoubleClick(latestThumbnail.displaySetInstanceUID);
          setHasLoadedAnnotations(true);
        }, 100);
      }
    };

    const handleElementEnabled = (event) => {
      const element = event.detail.element;
      handleImageRendered(event);
    };

    const findViewportElement = (): HTMLElement | null => {
      // First try querySelector
      const elementByQuery = document.querySelector(`.${viewportId}`);
      if (elementByQuery instanceof HTMLElement) {
        return elementByQuery;
      }

      // If querySelector fails, try getElementsByClassName
      const elementsByClass = document.getElementsByClassName(viewportId);
      if (elementsByClass.length > 0 && elementsByClass[0] instanceof HTMLElement) {
        return elementsByClass[0];
      }

      return null;
    };


    const setupEventListeners = () => {
      const element = findViewportElement();

      if (element) {
        // Element found, set up listeners
        element.addEventListener('CORNERSTONE_IMAGE_RENDERED', handleElementEnabled);
        retryCount.current = 0; // Reset retry count
        return true;
      } else if (retryCount.current < maxRetries) {
        // Element not found, retry after delay
        retryCount.current += 1;
        timeoutRef.current = setTimeout(setupEventListeners, 500);
        return false;
      } else {
        console.warn(`Failed to find viewport element after ${maxRetries} attempts`);
        return false;
      }
    };

    // Start the initial attempt
    setupEventListeners();

    // Cleanup function
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Remove event listeners if element exists
      const element = document.getElementById(viewportId);
      if (element) {
        element.removeEventListener('CORNERSTONE_IMAGE_RENDERED', handleElementEnabled);
      }

      // Reset retry count
      retryCount.current = 0;
    };
  }, [hasLoadedAnnotations, latestThumbnail, onThumbnailDoubleClick, viewportId, maxRetries]);

  return (
    <div
      id="ohif-thumbnail-list"
      className="ohif-scrollbar study-min-height overflow-y-hidden bg-white py-3"
    >
      {updatedThumbnails.map(
        ({
          displaySetInstanceUID,
          description,
          dragData,
          seriesNumber,
          numInstances,
          modality,
          componentType,
          seriesDate,
          countIcon,
          viewportIdentificator,
          isTracked,
          canReject,
          onReject,
          imageSrc,
          messages,
          imageAltText,
          isHydratedForDerivedDisplaySet,
        }) => {
          const isActive = activeDisplaySetInstanceUIDs.includes(displaySetInstanceUID);
          switch (componentType) {
            case 'thumbnail':
              return (
                <Thumbnail
                  key={displaySetInstanceUID}
                  displaySetInstanceUID={displaySetInstanceUID}
                  dragData={dragData}
                  description={description}
                  seriesNumber={seriesNumber}
                  numInstances={numInstances}
                  countIcon={countIcon}
                  imageSrc={imageSrc}
                  imageAltText={imageAltText}
                  messages={messages}
                  viewportIdentificator={viewportIdentificator}
                  isActive={isActive}
                  onClick={() => onThumbnailClick(displaySetInstanceUID)}
                  onDoubleClick={() => onThumbnailDoubleClick(displaySetInstanceUID)}
                />
              );
            case 'thumbnailTracked':
              return (
                <ThumbnailTracked
                  key={displaySetInstanceUID}
                  displaySetInstanceUID={displaySetInstanceUID}
                  dragData={dragData}
                  description={description}
                  seriesNumber={seriesNumber}
                  numInstances={numInstances}
                  countIcon={countIcon}
                  imageSrc={imageSrc}
                  imageAltText={imageAltText}
                  messages={messages}
                  viewportIdentificator={viewportIdentificator}
                  isTracked={isTracked}
                  isActive={isActive}
                  onClick={() => onThumbnailClick(displaySetInstanceUID)}
                  onDoubleClick={() => onThumbnailDoubleClick(displaySetInstanceUID)}
                  onClickUntrack={() => onClickUntrack(displaySetInstanceUID)}
                />
              );
            case 'thumbnailNoImage':
              return (
                <ThumbnailNoImage
                  key={displaySetInstanceUID}
                  displaySetInstanceUID={displaySetInstanceUID}
                  dragData={dragData}
                  modality={modality}
                  modalityTooltip={_getModalityTooltip(modality)}
                  messages={messages}
                  seriesDate={seriesDate}
                  description={description}
                  canReject={canReject}
                  onReject={onReject}
                  onClick={() => onThumbnailClick(displaySetInstanceUID)}
                  onDoubleClick={() => onThumbnailDoubleClick(displaySetInstanceUID)}
                  viewportIdentificator={viewportIdentificator}
                  isHydratedForDerivedDisplaySet={isHydratedForDerivedDisplaySet}
                />
              );
            default:
              return <></>;
          }
        }
      )}
    </div>
  );
};

ThumbnailList.propTypes = {
  thumbnails: PropTypes.arrayOf(
    PropTypes.shape({
      displaySetInstanceUID: PropTypes.string.isRequired,
      imageSrc: PropTypes.string,
      imageAltText: PropTypes.string,
      seriesDate: PropTypes.string,
      seriesNumber: Types.StringNumber,
      numInstances: PropTypes.number,
      description: PropTypes.string,
      componentType: Types.ThumbnailType.isRequired,
      viewportIdentificator: Types.StringArray,
      isTracked: PropTypes.bool,
      dragData: PropTypes.shape({
        type: PropTypes.string.isRequired,
      }),
    })
  ),
  activeDisplaySetInstanceUIDs: PropTypes.arrayOf(PropTypes.string),
  onThumbnailClick: PropTypes.func.isRequired,
  onThumbnailDoubleClick: PropTypes.func.isRequired,
  onClickUntrack: PropTypes.func.isRequired,
  viewportId: PropTypes.string,
};

const _modalityTooltips = {
  SR: 'Structured Report',
  SEG: 'Segmentation',
  RTSTRUCT: 'RT Structure Set',
};

function _getModalityTooltip(modality) {
  if (_modalityTooltips.hasOwnProperty(modality)) {
    return _modalityTooltips[modality];
  }
  return 'Unknown';
}

export default ThumbnailList;
