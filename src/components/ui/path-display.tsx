type PathDisplayComponentPtops = {
    path: string
}
export function PathDisplayComponent({ path }: PathDisplayComponentPtops) {
    return (
        <div className='max-w-lx mx-auto mt-8'>
            <div className='border-2 border-gray-300 rounded-lg p-4 flex items-center'>
                <span className='font-bold mr-2'>Your path is:</span>
                <span className='text-gray-600'>{path}</span>
            </div>
        </div>
    )
}
