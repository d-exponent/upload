import { CreateJobCommand, ElasticTranscoderClient, ReadJobCommand } from '@aws-sdk/client-elastic-transcoder'

import env from '../../env'

const client = new ElasticTranscoderClient({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_ACCESS_SECRET_KEY,
  },
})

const audioPipeline = '1688075020790-xpttmw'
const videoPipelineID = '1688075475898-a42ghp'

export const createJob = async (data: any, type: 'audio' | 'video') => {
  const PipelineId = type === 'audio' ? audioPipeline : videoPipelineID
  const auto = 'auto'

  let inputParamsArray = []

  for (let i = 0; i < data.length; i++) {
    const Key = data[i].key

    const inputParams: any = {
      PipelineId,
      Input: {
        Key,
        frame_rate: auto,
        resolution: auto,
        aspect_ratio: auto,
        container: auto,
      },
      Outputs: [{ Key, PresetId: '1351620000001-100200' }],
    }
    inputParamsArray.push(inputParams)
  }

  return jobsCommands(inputParamsArray)
}

const jobsCommands = async (inputs: any[]) => {
  let cJobCmd = []
  let resArry = []
  let readCmd = []
  let results = []

  for (let i = 0; i < inputs.length; i++) {
    const createJobCommand = new CreateJobCommand(inputs[i])
    cJobCmd.push(createJobCommand)
  }

  for (let j = 0; j < cJobCmd.length; j++) {
    const response: any = await client.send(cJobCmd[j])
    resArry.push(response)
  }

  for (let k = 0; k < resArry.length; k++) {
    await waitForJobCompletion(resArry[k].Job.Id)
    const readJobCommand = new ReadJobCommand({ Id: resArry[k].Job.Id })
    readCmd.push(readJobCommand)
  }

  for (let m = 0; m < readCmd.length; m++) {
    const jobDetails: any = await client.send(readCmd[m])
    const jobDetailsOutput = jobDetails.Job.Outputs[0]

    const outputURL = jobDetailsOutput.Key
    const outputObjectURL = `https://${env.AWS_BUCKET_REGION}.amazonaws.com/${env.AWS_OUTPUT_BUCKET}/${outputURL}`
    const duration = jobDetailsOutput.Duration
    const filename = jobDetailsOutput.Key.split('/').pop()
    const filesize = jobDetailsOutput.FileSize
    const res = {
      outputObjectURL,
      duration,
      filename,
      filesize,
    }
    results.push(res)
  }

  return results
}

const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const readJobCommand = new ReadJobCommand({ Id: jobId })
    const jobDetails: any = await client.send(readJobCommand)
    const status = jobDetails.Job.Status

    if (status === 'Complete' || status === 'Error' || status === 'Canceled') {
      break
    }

    await delay(5000) // Wait for 5 seconds before checking the job status again
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
