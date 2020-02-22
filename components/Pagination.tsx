import { NextPage } from "next";
const Pagination: NextPage<{
  page: number;
  maxPage: number;
  halfWidth: number;
  onChange(newPage: number): void;
}> = ({ page, maxPage, halfWidth, onChange }) => {
  maxPage = Math.max(1, maxPage);
  let items = [];
  let startIndex = Math.max(
    1,
    Math.min(page - halfWidth, maxPage - 2 * halfWidth)
  );
  for (
    let idx = startIndex;
    idx <= Math.min(maxPage, startIndex + 2 * halfWidth);
    idx++
  ) {
    items.push(
      <li key={idx} className={"page-item" + (idx == page ? " active" : "")}>
        <a className="page-link" href="#" onClick={() => onChange(idx)}>
          {idx}
        </a>
      </li>
    );
  }
  let tabIndexm1 = { tabIndex: -1 };
  let hasPrevious = page > 1;
  let hasNext = page < maxPage;
  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={"page-item" + (hasPrevious ? "" : " disabled")}>
          <a
            className="page-link"
            href="#"
            onClick={() => onChange(1)}
            {...(hasPrevious ? {} : tabIndexm1)}
          >
            &laquo;
          </a>
        </li>
        <li className={"page-item" + (hasPrevious ? "" : " disabled")}>
          <a
            className="page-link"
            href="#"
            onClick={() => onChange(Math.max(1, page - 1))}
            {...(hasPrevious ? {} : tabIndexm1)}
          >
            &lsaquo;
          </a>
        </li>
        {items}
        <li className={"page-item" + (hasNext ? "" : " disabled")}>
          <a
            className="page-link"
            href="#"
            onClick={() => onChange(Math.min(maxPage, page + 1))}
            {...(hasNext ? {} : tabIndexm1)}
          >
            &rsaquo;
          </a>
        </li>
        <li className={"page-item" + (hasNext ? "" : " disabled")}>
          <a
            className="page-link"
            href="#"
            onClick={() => onChange(maxPage)}
            {...(hasNext ? {} : tabIndexm1)}
          >
            &raquo;
          </a>
        </li>
      </ul>
    </nav>
  );
};
export default Pagination;
