import axios from 'axios'

const STORAGE_KEY = 'app_version'
const VERSION_FILE = '/version.json'

export const getCurrentVersion = () => {
  return localStorage.getItem(STORAGE_KEY) || '0.0.0'
}

export const setCurrentVersion = (version) => {
  localStorage.setItem(STORAGE_KEY, version)
}

export const checkForUpdate = async () => {
  try {
    const response = await axios.get(VERSION_FILE, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    const latestVersion = response.data.version
    const currentVersion = getCurrentVersion()
    
    if (latestVersion !== currentVersion) {
      setCurrentVersion(latestVersion)
      return {
        hasUpdate: true,
        currentVersion,
        latestVersion
      }
    }
    
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion
    }
  } catch (error) {
    console.error('Failed to check for updates:', error)
    return {
      hasUpdate: false,
      currentVersion: getCurrentVersion(),
      latestVersion: 'unknown'
    }
  }
}

export const refreshPage = () => {
  window.location.reload(true)
}