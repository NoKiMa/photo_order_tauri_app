import { invoke } from '@tauri-apps/api/tauri'
import { PathDisplayComponent } from '@/components/path-display'
import { useAtom } from 'jotai'
import { pathAtom, pathErrorAtom } from '@/store/pathStore'

export function FolderSelector() {
    const [path, setPath] = useAtom<string | null>(pathAtom)
    const [pathError, setPathError] = useAtom<string | null>(pathErrorAtom)

    const openFolder = async () => {
        try {
            const selectedFolderPath = await invoke<string>('open_file_system')
            console.log(`selectedFolderPath: ${selectedFolderPath}`)
            if (selectedFolderPath) {
                console.log('Selected Folder Path:', selectedFolderPath)
                // Update the UI here to show the selected folder path
                setPath(selectedFolderPath)
            } else {
                console.log('No folder selected')
            }
        } catch (error) {
            console.error('Failed to open folder:', error)
            setPathError(`Failed to open folder:${error}`)
        }
    }

    return (
        <div className='p-4 max-w-2xl mx-auto'>
            <div>
                <button
                    onClick={openFolder}
                    className='px-4 py-2 bg-green-500 hover:border-green-700 text-white rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:bg-green-700 focus:ring-opacity-50'
                >
                    Select Folder
                </button>
            </div>
            {pathError && <p className='mt-4 text-red-500'>{pathError}</p>}
            {path && <PathDisplayComponent path={path} />}
        </div>
    )
}
