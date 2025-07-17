"use client";

import { Breadcrumb, Pagination } from "antd";
import {
  handleGetSearch,
  handleGetSearchFilter,
  searchSelector,
} from "@/services/redux/Slices/search";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import FilterTypeSearchBox from "@/components/ui/FilterTypeSearchBox";
import FilterTypeSliderRange from "@/components/ui/FilterTypeSliderRange";
import { IoMenu } from "react-icons/io5";
import IsArray from "@/components/ui/IsArray";
import Link from "next/link";
import ProductItem from "@/components/sections/ProductItem";
import Responsive from "@/components/layout/Responsive";
import { sortOptions } from "@/services/utils/sortOrder";
import { useSearchParams } from "next/navigation";

function Search() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const divRef = useRef(null);
  const search = searchParams.get("s");
  const brandParam = searchParams.get("brand");
  const objectParam = searchParams.get("object");
  const categoryParam = searchParams.get("category");
  const { search: searchData, onRefresh } = useSelector(searchSelector);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState();
  const [filterColors, setFilterColors] = useState([]);
  const [filterObjects, setFilterObjects] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterBrands, setFilterBrands] = useState([]);

  const { sortOrder, useFilters } = useMemo(() => {
    let sortOrder;
    let useFilters = {};
    if (sortBy) {
      sortOrder = sortBy;
    }

    if (brandParam) {
      useFilters.brand = brandParam;
    }
    if (objectParam) {
      useFilters.object = objectParam;
    }
    if (categoryParam) {
      useFilters.category = categoryParam;
    }
    if (priceRange) {
      useFilters.priceRange = priceRange;
    }

    if (Array.isArray(filterColors) && filterColors?.length > 0) {
      useFilters.colors = filterColors;
    }
    if (Array.isArray(filterObjects) && filterObjects?.length > 0) {
      useFilters.objects = filterObjects;
    }

    if (Array.isArray(filterBrands) && filterBrands?.length > 0) {
      useFilters.brands = filterBrands;
    }
    if (Array.isArray(filterCategories) && filterCategories?.length > 0) {
      useFilters.categories = filterCategories;
    }
    return { sortOrder, useFilters };
  }, [
    sortBy,
    priceRange,
    filterColors,
    filterObjects,
    filterCategories,
    filterBrands,
    brandParam,
    objectParam,
    categoryParam,
  ]);
  useEffect(() => {
    if (searchData?.filters) {
      dispatch(
        handleGetSearchFilter({
          keyword: search,
          sortOrder,
          useFilters,
          page,
        })
      );
    }
  }, [
    sortBy,
    priceRange,
    filterColors,
    filterBrands,
    filterObjects,
    filterCategories,
  ]);

  useEffect(() => {
    if (search)
      dispatch(
        handleGetSearch({ keyword: search, page, sortOrder, useFilters })
      );
    if (brandParam || objectParam || categoryParam) {
      dispatch(handleGetSearch({ sortOrder, useFilters, page }));
    }
  }, [search, brandParam, objectParam, categoryParam, page]);

  useEffect(() => {
    if (
      searchData?.products &&
      divRef.current &&
      page > 1 &&
      sortBy?.length > 0 &&
      priceRange?.length > 0 &&
      filterColors?.length > 0 &&
      filterObjects?.length > 0 &&
      filterCategories?.length > 0 &&
      filterBrands?.length > 0
    ) {
      divRef.current.scrollIntoView({
        behavior: "smooth", // Cuộn mượt mà
        block: "start", // Cuộn đến phần tử sao cho nó nằm ở đầu màn hình
      });
    }
  }, [
    searchData,
    page,
    sortBy,
    priceRange,
    filterColors,
    filterObjects,
    filterCategories,
    filterBrands,
  ]);

  return (
    <div>
      <div className="w-full pb-4">
        <Responsive>
          <div className="pb-3 pt-2">
            <Breadcrumb
              items={[
                {
                  title: <Link href={"/"}>Trang chủ</Link>,
                },
                {
                  title: "Tìm kiếm sản phẩm",
                },
              ]}
            />
          </div>
          <h1 className=" text-rose-500 text-5xl text-center">
            {search && `Tìm kiếm sản phẩm "${search}"`}
            {brandParam && `Tìm kiếm giày thương hiệu ${brandParam}`}
            {objectParam && `Tìm kiếm giày theo đối tượng ${objectParam}`}
            {categoryParam && `Tìm kiếm giày theo danh mục ${categoryParam}`}
          </h1>
          <div className=" mt-6 flex gap-4" ref={divRef}>
            <div className=" w-3/12 h-fit shadow-sm shadow-black/35 pb-4 rounded-lg sticky top-2">
              <div className=" font-semibold text-base py-3 px-3 border-b border-slate-200 flex items-center gap-1">
                <IoMenu />
                <h1>Bộ lọc nâng cao</h1>
              </div>

              <div className="p-3 min-h-0 max-h-[80vh] overflow-y-hidden hover:overflow-y-auto overflow-x-hidden scrollbar-custom">
                <FilterTypeSliderRange
                  onOption={([a, b]) =>
                    setPriceRange({
                      min: +a,
                      max: +b,
                    })
                  }
                />
                <FilterTypeSearchBox
                  title="Màu sản phẩm"
                  show={true}
                  data={searchData?.filters?.colors}
                  onOptions={(value) => setFilterColors(value)}
                  fieldName="name"
                />
                <FilterTypeSearchBox
                  title="Thương hiệu"
                  show={true}
                  onOptions={(value) => setFilterBrands(value)}
                  data={searchData?.filters?.brands}
                  fieldName="name"
                />

                <FilterTypeSearchBox
                  title="Đối tượng"
                  show={false}
                  onOptions={(value) => setFilterObjects(value)}
                  data={searchData?.filters?.objects}
                  fieldName="name"
                />

                <FilterTypeSearchBox
                  title="Loại giày"
                  show={false}
                  onOptions={(value) => setFilterCategories(value)}
                  data={searchData?.filters?.categories}
                  fieldName="name"
                />
              </div>
            </div>
            <div className=" w-9/12">
              <div className=" font-semibold text-base py-1 pb-3 flex items-center gap-2 justify-between">
                <h1 className=" text-xl">Danh sách sản phẩm</h1>

                <div className=" flex-center gap-2">
                  <label
                    for="countries"
                    class=" text-gray-900 font-normal shrink-0"
                  >
                    Sắp xếp theo
                  </label>
                  <select
                    id="countries"
                    class="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option selected>Tùy chọn</option>
                    {sortOptions.map((_, key) => (
                      <option key={key} value={_.value}>
                        {_.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <IsArray
                data={searchData?.products}
                renderElse={
                  <div className="h-1/4 flex justify-center items-center pb-12">
                    <div className=" w-full flex-col flex py-4">
                      <h1 className=" text-white text-shadow font-bold  py-2 text-center text-3xl">
                        Không tìm thấy sản phẩm.
                      </h1>
                    </div>
                  </div>
                }
              >
                <div className={`w-full h-auto grid gap-2 grid-cols-4`}>
                  {/* Child Item */}
                  {searchData?.products?.map((_, index) => {
                    return (
                      <ProductItem showTypes={true} data={_} key={index} />
                    );
                  })}
                </div>
                <div className="mt-8">
                  <Pagination
                    align="center"
                    defaultCurrent={1}
                    onChange={(page) => setPage(page)}
                    pageSize={searchData?.limit}
                    total={+searchData?.totalPage * +searchData?.limit}
                  />
                </div>
              </IsArray>
            </div>
          </div>
        </Responsive>
      </div>
    </div>
  );
}

export default Search;
