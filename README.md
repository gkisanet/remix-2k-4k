# 리믹스 정리

## tsconfig
- Remix and the tsconfig.json you get from the starter template are configured to allow imports from the app/ directory via ~ as demonstrated above, so you don't have ../../ all over the place.

## build
- npm run build
  - /build -> 서버사이드 코드
  - /public/build -> 클라이언트 사이드 코드

## liveReaload는 개발단계에서 aut-refresh 제공

## Routes 
- remix.config.js 에서도 라우팅 할 수 있지만, 보통 file based routing을 함
- app/routes/index.tx는 app/root.tsx 의 child 임. 
- 그래서 root.tsx에 <Outlet /> 을 넣음

## file naming convention
- app/jokes.tsx 에 <Outlet /> -> parent
- app/jokes/index.tsx 는 child
- Parameterized Route를 추가하고, 파라미터 암꺼나 넣으면 index.tsx를 렌더링 함.

## css 적용
```
import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

////////
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
```
- index.tsx head에 <Links /> 추가
- 근데 다른 페이지에는 css 적용 안됨
- global하게 적용하려면 root.tsx에 적용
- css module과 사용방법이 비슷, class name충돌을 막기 위한..

## prisma & sqlite 구성
-  sqlite 템플릿으로 Prisma 초기화
-  스키마 모델링 및 db push
- gitignore에 /prisma/dev.db 추가
-  seed.ts 로 seed주기, tsconfig-paths라는게 있네

## db connect
```
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
```
- 이렇게 seed.ts에 넣어도 되는데, 개발중에는 서버쪽 코드에 변경이 있을때 서버를 닫고 재시작하는게 번거롭다. 서버 변경이 있을때마다 새로운 db연결을 하게 해주는 db utils 생성
- filename db에 server가 포함되면 서버코드임을 브라우져에 알려줌. 
- Keeping in-memory server state across rebuilds
  - When server code is re-imported, any server-side in-memory state is lost. That includes things like database connections, caches, in-memory data structures, etc.

Here's a utility that remembers any in-memory values you want to keep around across rebuilds:

## read from db in a Remix loader

```
export const loader = async () => {
  return json({
    jokeListItems: await db.joke.findMany(),
  });
};
////
export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

return(
      <ul>
        {data.jokeListItems.map(({ id, name }) => (
        <li key={id}>
            <Link to={id}>{name}</Link>
        </li>
        ))}
    </ul>
)
 
```
- db 조건 걸기 (order by {createdAt : "desc" } , select , take )

## Network Type Safety
- useLoaderData / loader는 다른 환경에서 동작하기에 리믹스는 서버가 보낸 데이터를 정확히 받는지 확인해야 한다.
- 서버로부터 받는 데이터(useLoaderData에서 주는 데이터)가 원하는 타입의 데이터인지 확인하는 법은 assertion functions을 쓰는 법인데, 타입스크립트에서는 zod를 쓴다. 


## db 쿼리 감싸기
```
export const loader = async ({ params }: LoaderArgs) => {

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

/////

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  .
  .
  .
  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
```
- useEffect나 다른 hook함수를 쓰지 않고 단순히 form을 통해 async 함수로 form submit이 가능하더라..
- remix 의 redirect 유틸리티로  headers/status code를 가지는 Response 객체를 가지고 사용자가 특정 페이지로 redirect 하게 해준다.


## Validation
- client에서는 useState와 onChange로 폼 데이터로 validation 하잖아
- 그러면 서버측에서는 어떻게 하지?
- route module인 action function의 return 값은 loader function과 같았으면 하지. 그리고 action이 성공적으로 submit되면 실수로 이미 submit 한 값이 또 submit되지 않도록 redirect 되기를 원해
- 혹은 useActionData로 mutation(form submit)을 했는데 에러가 발생하면 발생한 에러값이 사용자에게 표출되도록 하고 싶어. 

## WAI-ARIA 
- https://github.com/lezhin/accessibility/blob/master/aria/README.md#aria-invalid
- 콘텐츠의 역할, 상태, 속성 정보를 제공
- 모든 요소에 사용할 수 있는건 아니니 w3 명세에서 확인
- aria-invalid 속성은 주로 input 요소에 선언하여 사용자가 입력한 값이 요구하는 형식과 일치하는지 여부를 나타냅니다. aria-errormessage 속성과 함께 사용하여 오류 설명을 제공할 수 있습니다.

## Optional chaining
- 존재하거나 하지 않을 수 있는 속성에 접근 , 함수 호출
```javascript
// what we did before optional chaining:
const streetName = user && user.address && user.address.street.name

// what we can do now:
const streetName = user?.address?.street?.name
```

## Authentication
- HTTP cookies가 작동하는 법 공부하기
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
  + Session management
  + Personalization
  + Tracking
 - bcryptjs 로 password 해쉬화 하기.
 -  login후 세션 생성하고, set-Cookie 헤더랑 같이 jokes 페이지로 리다이렉트  
 - hidden input 과 useSearchParams 의 조합으로 사용자가 어디로 redirectTo 할지를 알려줌.


 - Remember, actions and loaders run on the server, so console.log calls you put in those you can't see in the browser console. Those will show up in the terminal window you're running your server in.
 
