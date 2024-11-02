'use client'


import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {useToast} from "@/hooks/use-toast";

interface List {
  id: string;
  items: string[];
  isSelected: boolean;
}

const Page = () => {
  const [lists, setLists] = useState<List[]>([
    { id: '1', items: [], isSelected: true },
    { id: '2', items: [], isSelected: true }
  ]);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({
    '1': '',
    '2': ''
  });
  const resultRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const addNewList = () => {
    const newId = (lists.length + 1).toString();
    setLists([...lists, { id: newId, items: [], isSelected: true }]);
    setInputs({ ...inputs, [newId]: '' });
  };

  const removeList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
    const newInputs = { ...inputs };
    delete newInputs[id];
    setInputs(newInputs);
  };

  const removeItemFromList = (listId: string, itemIndex: number) => {
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, items: list.items.filter((_, index) => index !== itemIndex) }
        : list
    ));
  };

  const toggleListSelection = (listId: string) => {
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, isSelected: !list.isSelected }
        : list
    ));
  };

  const handleInputChange = (listId: string, value: string) => {
    setInputs({ ...inputs, [listId]: value });
    
    if (value.includes('\n') || value.includes('\r')) {
      const newItems = value
        .split(/[\n\r]+/)
        .filter(item => item.trim() !== '')
        .map(item => item.trim());
      
      if (newItems.length > 0) {
        setLists(lists.map(list =>
          list.id === listId
            ? { ...list, items: [...list.items, ...newItems] }
            : list
        ));
        setInputs({ ...inputs, [listId]: '' });
      }
    }
  };

  const handlePaste = (listId: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newItems = pastedText
      .split(/[\n\r]+/)
      .filter(item => item.trim() !== '')
      .map(item => item.trim());

    if (newItems.length > 0) {
      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, items: [...list.items, ...newItems] }
          : list
      ));
    }
  };

  const combinations = lists
    .filter(list => list.isSelected)
    .reduce((acc, list, index) => {
      if (index === 0) return list.items;
      return acc.flatMap(item1 =>
        list.items.map(item2 => `${item1}${item2}`)
      );
    }, [] as string[]).join('\n');

  const copyToClipboard = () => {
    if (resultRef.current) {
      resultRef.current.select()
      document.execCommand('copy')
      toast({
        title: "복사 완료",
        description: "결과가 클립보드에 복사되었습니다.",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>단어 조합기</span>
            <Button onClick={addNewList}>새 리스트 추가</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {lists.map((list) => (
              <div key={list.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                      리스트 {list.id}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={list.isSelected}
                        onChange={() => toggleListSelection(list.id)}
                        className="w-4 h-4"
                        id={`checkbox-${list.id}`}
                      />
                      <label htmlFor={`checkbox-${list.id}`} className="text-sm text-gray-600">
                        조합에 포함
                      </label>
                    </div>
                  </div>
                  {lists.length > 2 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeList(list.id)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={inputs[list.id]}
                    onChange={(e) => handleInputChange(list.id, e.target.value)}
                    onPaste={(e) => handlePaste(list.id, e)}
                    placeholder="단어를 입력하세요 (Enter로 추가)"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {list.items.map((item, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeItemFromList(list.id, index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold">조합 결과</h3>
            <Textarea
              ref={resultRef}
              value={combinations}
              readOnly
              className="h-40 whitespace-pre overflow-y-auto"
            />
            <Button onClick={copyToClipboard}>결과 복사</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page;
