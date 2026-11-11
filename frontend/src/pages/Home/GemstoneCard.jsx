export default function GemstoneCard({ title, image, onClick }) {
    return (
        <div className="w-full md:w-64 md:w-64 text-center px-2">
            {/* Image Container */}
            <div
                onClick={onClick}
                className="cursor-pointer rounded-lg overflow-hidden group
                           h-44 sm:h-48 md:h-40 flex items-center justify-center bg-white"
            >
                <img
                    src={image}
                    alt={title}
                    className="max-h-full max-w-full object-contain
                               group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Title
            <p className="mt-3 font-medium text-sm md:text-base">
                {title}
            </p> */}

            {/* Explore More */}
            <p
                onClick={onClick}
                className="inline-flex items-center gap-1
                               text-sm text-blue-600 cursor-pointer
                               font-serif tracking-wide italic
                               px-4 py-1.5 rounded-full
                               hover:bg-blue-50 hover:text-blue-700
                               transition"
            >
                Explore More →
            </p>
        </div>
    );
}
