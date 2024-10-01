import { LayersIcon } from '@radix-ui/react-icons'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FolderSelector } from '@/components/ui/folder-selector'
import { useAtom } from 'jotai'
import { pathAtom } from '@/store/pathStore'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'
import { ReactEventHandler, useEffect, useState } from 'react'
import { TypeFormat } from '@/types/formatTypes'

function App() {
    const [path, setPath] = useAtom(pathAtom)
    const [isSuccesed, setIsSuccesed] = useState(false)
    const [formatType, setFormatType] = useState<string | null>(null)

    const startSorting = async (path: string) => {
        invoke('list_files_in_folder', { folderPath: path })
            .then((response) =>
                invoke('file_handler', {
                    fileList: response,
                    parentFolderPath: path,
                    typeFormat: formatType || '',
                })
                    .then(() => {
                        setIsSuccesed(true)
                        console.log('Succses')
                    })
                    .catch((e) => {
                        console.error('Error 2: ', e)
                    })
            )
            .catch((e) => {
                console.error('Error 1: ', e)
            })
    }

    useEffect(() => {
        console.log(`formatType: ${formatType}`)
    }, [formatType])

    useEffect(() => {
        if (isSuccesed) {
            setTimeout(() => {
                setIsSuccesed(false)
                setPath(null)
            }, 5000)
        }
    }, [isSuccesed])

    const handleValueChange = (newValue: string) => {
        setFormatType(newValue)
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
                    Select the folder in which you want to sort the photos.
                </p>
                <p className='font-bold'>
                    We need the path to start sorting files in the source
                    folder.
                </p>
                <p className='font-bold text-green-500'>Let's do it</p>
            </div>
            <div className='bg-amber-300 w-screen'>
                <FolderSelector />
            </div>
            {path && (
                <div className='my-5'>
                    <Select
                        value={formatType ?? undefined}
                        onValueChange={handleValueChange}
                    >
                        <SelectTrigger className='w-[180px] text-green-500 border-green-500 bg-amber-300'>
                            <SelectValue
                                className='text-green-500 hover:text-green-700'
                                placeholder='Type of sorting'
                            />
                        </SelectTrigger>
                        <SelectContent className='border-green-500 bg-amber-300 text-green-500 hover:!text-green-700'>
                            <SelectItem
                                className='!text-green-500  hover:!text-green-700  active:!text-green-700 !bg-amber-300 hover:!bg-amber-300'
                                value={TypeFormat.YYYYMMDD}
                            >
                                Year.Month.Day
                            </SelectItem>
                            <SelectItem
                                className='!text-green-500 hover:!text-green-700  active:!text-green-700 !bg-amber-300 hover:!bg-amber-300'
                                value={TypeFormat.YYYYMM}
                            >
                                Year.Month
                            </SelectItem>
                            <SelectItem
                                className='!text-green-500 hover:!text-green-700  active:!text-green-700 !bg-amber-300 hover:!bg-amber-300'
                                value={TypeFormat.YYYY}
                            >
                                Year
                            </SelectItem>
                            <SelectItem
                                className='!text-green-500 hover:!text-green-700 active:!text-green-700 !bg-amber-300 hover:!bg-amber-300 active:!bg-amber-300'
                                value={TypeFormat.DDMMYYYY}
                            >
                                Day.Month.Year
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            {path && formatType && (
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
                            setIsSuccesed(false)
                        }}
                        className='px-4 py-2 bg-white hover:border-green-700 text-green-500 rounded hover:bg-white focus:outline-none focus:ring-2 focus:bg-green-700 focus:ring-opacity-50'
                    >
                        Cancel
                    </button>
                </div>
            )}
            {isSuccesed && (
                <div className='my-5'>
                    <h1 className='text-green-500 font-bold text-2xl'>
                        Congradulation!
                    </h1>
                    <h2 className='text-green-500 font-bold text-1xl'>
                        Files were sorted
                    </h2>
                </div>
            )}
        </div>
    )
}

export default App
