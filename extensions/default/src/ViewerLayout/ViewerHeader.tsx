import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { ErrorBoundary, UserPreferences, AboutModal, Header, useModal, Button } from '@ohif/ui';
import i18n from '@ohif/i18n';
import { hotkeys } from '@ohif/core';
import { useAppConfig } from '@state';
import Toolbar from '../Toolbar/Toolbar';

const { availableLanguages, defaultLanguage, currentLanguage } = i18n;

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

function ViewerHeader({ hotkeysManager, extensionManager, servicesManager }) {
  const [appConfig] = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('readOnly'))) {
      setReadOnly(JSON.parse(localStorage.getItem('readOnly'))?.readOnly);
    } else {
      console.log('we are in false....');
    }
  }, []);

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);
    const query = new URLSearchParams(window.location.search);
    const configUrl = query.get('configUrl');

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }

    if (configUrl) {
      searchQuery.append('configUrl', configUrl);
    }

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const { t } = useTranslation();
  const { show, hide } = useModal();
  const { hotkeyDefinitions, hotkeyDefaults } = hotkeysManager;
  const versionNumber = process.env.VERSION_NUMBER;
  const commitHash = process.env.COMMIT_HASH;

  const menuOptions = [
    {
      title: t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: 'About OHIF Viewer',
          contentProps: { versionNumber, commitHash },
        }),
    },
    {
      title: t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          title: t('UserPreferencesModal:User Preferences'),
          content: UserPreferences,
          contentProps: {
            hotkeyDefaults: hotkeysManager.getValidHotkeyDefinitions(hotkeyDefaults),
            hotkeyDefinitions,
            currentLanguage: currentLanguage(),
            availableLanguages,
            defaultLanguage,
            onCancel: () => {
              hotkeys.stopRecord();
              hotkeys.unpause();
              hide();
            },
            onSubmit: ({ hotkeyDefinitions, language }) => {
              if (language.value !== currentLanguage().value) {
                i18n.changeLanguage(language.value);
              }
              hotkeysManager.setHotkeys(hotkeyDefinitions);
              hide();
            },
            onReset: () => hotkeysManager.restoreDefaultBindings(),
            hotkeysModule: hotkeys,
          },
        }),
    },
  ];

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }
  const onExitButtonClick = async () => {
    window.close();
  };

  return (
    <Header
      menuOptions={menuOptions}
      isReturnEnabled={false}
      onClickReturnButton={onClickReturnButton}
      WhiteLabeling={appConfig.whiteLabeling}
    >
      <ErrorBoundary context="Primary Toolbar">
        <div className="relative flex w-full items-center justify-center">
          {!readOnly && <Toolbar servicesManager={servicesManager} />}
          <Button
            className="absolute right-0 mr-4"
            onClick={onExitButtonClick}
          >
            Exit
          </Button>
        </div>
      </ErrorBoundary>
    </Header>
  );
}

export default ViewerHeader;
