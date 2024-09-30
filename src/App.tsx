import { LayersIcon } from '@radix-ui/react-icons'
import { FolderSelector } from '@/components/folder-selector'
import { useAtom } from 'jotai'
import { pathAtom } from '@/store/pathStore'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'

function App() {
    const [path, setPath] = useAtom(pathAtom)

    const startSorting = async (path: string) => {
        invoke('list_files_in_folder', { folderPath: path })
            .then((response) =>
                invoke('file_handler', {
                    fileList: response,
                    parentFolderPath: path,
                })
                    .then(() => console.log('Succses'))
                    .catch((e) => {
                        console.error('Error 2: ', e)
                    })
            )
            .catch((e) => {
                console.error('Error 1: ', e)
            })
    }

    return (
        <div className='container flex items-center justify-center m-0 p-0'>
            <div className='w-screen m-0 p-0'>
                <h1 className='text-4xl'>Welcome to Photo Order</h1>
                <h3>v0.0.1</h3>
            </div>

            <div className='row'>
                <LayersIcon className='w-[96px] h-[96px] stroke-green-500 items-center m-5' />
            </div>
            <div className='my-5'>
                <p className='font-bold'>
                    Select the folder in which you want to sort the photos to
                    get the path.
                </p>
                <p className='font-bold'>
                    The path needs to start sorting files in the source folder.
                </p>
                <p className='font-bold text-red-600'>Let's do it</p>
            </div>
            <div className='bg-amber-300 w-screen'>
                <FolderSelector />
            </div>
            {path && (
                <div className='flex justify-between justify-between'>
                    <button
                        onClick={() => {
                            startSorting(path)
                        }}
                        className='px-4 py-2 mx-3 bg-green-500 hover:border-green-700 text-white rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:bg-green-700 focus:ring-opacity-50'
                    >
                        Start sorting
                    </button>
                    <button
                        onClick={() => {
                            setPath(null)
                        }}
                        className='px-4 py-2 bg-white hover:border-green-700 text-green-500 rounded hover:bg-white focus:outline-none focus:ring-2 focus:bg-green-700 focus:ring-opacity-50'
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}

export default App
