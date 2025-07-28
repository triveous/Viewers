import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Thumbnail } from '../Thumbnail';

const ThumbnailList = ({
  thumbnails,
  onThumbnailClick,
  onThumbnailDoubleClick,
  onClickUntrack,
  activeDisplaySetInstanceUIDs = [],
  viewPreset,
  onThumbnailContextMenu,
  viewportId = 'cornerstone-viewport-element', // ID of your cornerstone viewport element
  maxRetries = 10,
}: withAppTypes) => {
  const [hasLoadedAnnotations, setHasLoadedAnnotations] = useState(false);
  const retryCount = useRef(0);
  const timeoutRef = useRef(null);
  // const mutationObserverRef = useRef(null);

  // console.log('---ThumbnailList', thumbnails);
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
    // console.log('---ThumbnailList', latestThumbnail);
    const handleImageRendered = event => {
      if (!hasLoadedAnnotations && latestThumbnail?.displaySetInstanceUID) {
        setTimeout(() => {
          onThumbnailDoubleClick(latestThumbnail.displaySetInstanceUID);
          setHasLoadedAnnotations(true);
        }, 2000);
      }
    };

    const handleElementEnabled = event => {
      const element = event.detail.element;
      // console.log('---event from handleElementEnabled : ', event);
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

    const setupBasicEventListeners = () => {
      const element = findViewportElement();
      console.log('---element from setupBasicEventListeners : ', element);
      if (element) {
        // Element found, set up listeners
        element.addEventListener('CORNERSTONE_STACK_NEW_IMAGE', handleElementEnabled);
        retryCount.current = 0; // Reset retry count
        return true;
      } else if (retryCount.current <= maxRetries) {
        // Element not found, retry after delay
        retryCount.current += 1;
        timeoutRef.current = setTimeout(setupBasicEventListeners, 500);
        return false;
      } else {
        console.warn(`Failed to find viewport element after ${maxRetries} attempts`);
        return false;
      }
    };
    setupBasicEventListeners();
    // setupMutationObserver();

    // Cleanup function
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Remove event listeners if element exists
      const element = document.getElementById(viewportId);
      if (element) {
        element.removeEventListener('CORNERSTONE_STACK_NEW_IMAGE', handleElementEnabled);
      }
      // Reset retry count
      retryCount.current = 0;
      // if (mutationObserverRef.current) {
      //   mutationObserverRef.current.disconnect();
      // }
    };
  }, [hasLoadedAnnotations, latestThumbnail, onThumbnailDoubleClick, viewportId, maxRetries]);

  return (
    <div
      className="min-h-[350px]"
      style={{
        '--radix-accordion-content-height': '350px',
      }}
    >
      <div
        id="ohif-thumbnail-list"
        className={`ohif-scrollbar place-items-center overflow-y-hidden bg-white pt-[4px] pr-[2.5px] pl-[2.5px]`}
      >
        {thumbnails.map(
          ({
            displaySetInstanceUID,
            description,
            dragData,
            seriesNumber,
            numInstances,
            loadingProgress,
            modality,
            componentType,
            countIcon,
            isTracked,
            canReject,
            onReject,
            imageSrc,
            messages,
            imageAltText,
            isHydratedForDerivedDisplaySet,
          }) => {
            const isActive = activeDisplaySetInstanceUIDs.includes(displaySetInstanceUID);
            if (modality === 'SR' && description !== 'Image label/diagnoses') {
              return <></>;
            }
            return (
              <Thumbnail
                key={displaySetInstanceUID}
                displaySetInstanceUID={displaySetInstanceUID}
                dragData={dragData}
                description={description}
                seriesNumber={seriesNumber}
                numInstances={numInstances || 1}
                countIcon={countIcon}
                imageSrc={imageSrc}
                imageAltText={imageAltText}
                messages={messages}
                isActive={isActive}
                modality={modality}
                viewPreset={componentType === 'thumbnailNoImage' ? 'list' : viewPreset}
                thumbnailType={componentType}
                onClick={() => onThumbnailClick(displaySetInstanceUID)}
                onDoubleClick={() => onThumbnailDoubleClick(displaySetInstanceUID)}
                isTracked={isTracked}
                loadingProgress={loadingProgress}
                onClickUntrack={() => onClickUntrack(displaySetInstanceUID)}
                isHydratedForDerivedDisplaySet={isHydratedForDerivedDisplaySet}
                canReject={canReject}
                onReject={onReject}
                onThumbnailContextMenu={onThumbnailContextMenu}
              />
            );
          }
        )}
      </div>
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
      seriesNumber: PropTypes.any,
      numInstances: PropTypes.number,
      description: PropTypes.string,
      componentType: PropTypes.any,
      isTracked: PropTypes.bool,
      /**
       * Data the thumbnail should expose to a receiving drop target. Use a matching
       * `dragData.type` to identify which targets can receive this draggable item.
       * If this is not set, drag-n-drop will be disabled for this thumbnail.
       *
       * Ref: https://react-dnd.github.io/react-dnd/docs/api/use-drag#specification-object-members
       */
      dragData: PropTypes.shape({
        /** Must match the "type" a dropTarget expects */
        type: PropTypes.string.isRequired,
      }),
    })
  ),
  activeDisplaySetInstanceUIDs: PropTypes.arrayOf(PropTypes.string),
  onThumbnailClick: PropTypes.func.isRequired,
  onThumbnailDoubleClick: PropTypes.func.isRequired,
  onClickUntrack: PropTypes.func.isRequired,
  viewPreset: PropTypes.string,
};

export { ThumbnailList };
