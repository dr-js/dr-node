import { configureAuthFile } from 'dr-server/module/feature/Auth/configure'
import { fileUpload, fileDownload, pathAction } from 'dr-server/module/feature/Explorer/task/client'

const startClient = async ({
  modeName,
  log,
  authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap,
  ...optionData
}) => {
  const { authFetch } = await configureAuthFile({ authFile, authFileGenTag, authFileGenSize, authFileGenTokenSize, authFileGenTimeGap, log })

  optionData.authFetch = authFetch
  optionData.log = log

  switch (modeName) {
    case 'node-path-action':
      return pathAction(optionData)
    case 'node-file-upload':
      await fileUpload(optionData)
      break
    case 'node-file-download':
      await fileDownload(optionData)
      break
  }
}

export { startClient }
