import React, { useEffect, useRef } from 'react';

declare var LForms: any;

const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(null); // Script is already loaded
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(null);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const LhcFormComponent = (props: {
  questionaireObject: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const { questionaireObject, setUserData } = props;
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLFormsAndFHIR = async () => {
      try {
        // Load the necessary LForms and FHIR support files
        await loadScript(
          'https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/styles.css'
        );
        await loadScript(
          'https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/assets/lib/zone.min.js'
        );
        await loadScript(
          'https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/lhc-forms.js'
        );
        await loadScript(
          'https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/fhir/R4/lformsFHIR.min.js'
        );

        // Check if LForms is loaded
        if (typeof LForms !== 'undefined') {
          // Set the FHIR context
          LForms.Util.setFHIRContext({
            fhirVersion: 'R4',
          });

          if (formRef.current && questionaireObject) {
            // Check if formData has the necessary properties
            if (questionaireObject.resourceType && questionaireObject.item) {
              LForms.Util.addFormToPage(questionaireObject, formRef.current.id, {});
            } else {
              console.error(
                'questionaireObject is missing required properties:',
                questionaireObject
              );
            }
          } else {
            console.error('formRef or questionaireObject is not available:', {
              formRef,
              questionaireObject,
            });
          }
        } else {
          console.error('LForms is not defined');
        }
      } catch (error) {
        console.error('Error loading LForms or FHIR support:', error);
      }
    };

    loadLFormsAndFHIR();
  }, [questionaireObject]);

  const getUserData = () => {
    if (formRef.current && typeof LForms !== 'undefined') {
      const data = LForms.Util.getUserData(formRef.current, false, false, true);
      console.log('----questionaire response-----', data);
      setUserData(data);
    }
  };

  return (
    <div>
      <div
        ref={formRef}
        id="myFormContainer"
      ></div>
      <button
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={getUserData}
      >
        Submit
      </button>
    </div>
  );
};

export default LhcFormComponent;
