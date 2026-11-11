import { Button } from "../ui/button"

//helper function for pagination with additional logic
const getVisiblePages = (totalPage, currentPage) => {
  const max_pages = 5;
  const half = Math.floor(currentPage / 2); // we get half value of the current page.

  let start, end;

  //core logic
  if (totalPage <= max_pages) {
    start = 1;
    end = totalPage;
    // near start
  } else if (currentPage <= half + 1) {
    start = 1;
    end = max_pages;
  } else if (currentPage >= totalPage - half) {
    start = totalPage - max_pages + 1;
    end = totalPage;
  } else {
    start = currentPage - half;
    end = currentPage + half;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);

};


const Pagination = ({ currentPage, totalPage, onPageChange }) => {
  const pages = getVisiblePages(totalPage, currentPage);


  return (
    <div className="px-5 py-3 border-t border-[rgba(18,2,19,0.1)]">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#120213] opacity-80">
          Page {currentPage} of {totalPage}
        </div>

        <div className="flex gap-1 item-center">

          {/*first button*/}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="cursor-pointer"
          >
            First
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer"
          >
            Previous
          </Button>


          {/* Page Numbers */}
          {pages.map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPage}
            className="cursor-pointer"
          >
            Next
          </Button>

          {/*last button*/}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(totalPage)}
            disabled={currentPage === totalPage}
            className="cursor-pointer"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
