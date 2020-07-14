import { GetServerSideProps } from "next";
import { getMakes, Make } from "../database/getMakes";
import { getModels, Model } from "../database/getModel";
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select, { SelectProps } from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import router, { useRouter } from "next/router";
import { getAsString } from "../getAsString";
import useSWR from "swr";
import Button from "@material-ui/core/Button";

export interface HomeProps {
  makes: Make[];
  models: Model[];
  singleColumn?: boolean;
}

const useStyles = makeStyles(theme => ({
  paper: {
    margin: "auto",
    maxWidth: 500,
    padding: theme.spacing(3)
  }
}));

const prices = [500, 1000, 5000, 10000, 15000, 20000, 25000];

export default function Search({ makes, models, singleColumn }: HomeProps) {
  const classes = useStyles();
  //return <div>{JSON.stringify(makes, null, 4)}</div>;
  //There are 2 things we have to pass to Formik, they are initialValues and omSubmit fn

  const { query } = useRouter(); //Pass value từ router vào intialValues thì khi mà edit value trên route và refresh thì value đó sẽ tự động fill vào form. Now our make needs to know about Formik => add <Field> component from Formik in place of Material-ui 's <Select>. Nhớ thêm name="make" vào field thì sẽ connect this name with this field (data binding, one directional flow)
  const initialValues = {
    make: getAsString(query.make) || "all",
    model: getAsString(query.model) || "all",
    minPrice: getAsString(query.minPrice) || "all",
    maxPrice: getAsString(query.maxPrice) || "all"
  };

  const smValue = singleColumn ? 12 : 6;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        /* use shallow routing from Nextjs https://nextjs.org/docs/routing/shallow-routing 
      shallow navigation means navigate but are kept inside the same page. when we change the query param in the url, we DON'T want to do another getServerSideProps in the server, we just want to do things on FE side.

      Dùng router.push hay router.replace đều được. push: if we change query param 10 times you have to go back 10 times. replace: you have only 1 history in browser history, similar to facebook photo browsing, the url change but you just need 1 click to go back.
      */
        router.push(
          {
            pathname: "/cars",
            query: { ...values, page: 1 } //when user clicks 'Search', reset to page 1
          },
          undefined,
          { shallow: true }
        );
      }}
    >
      {/* values is automatically available in formik */}
      {({ values }) => (
        <Form>
          {/* elevation={5} gives us 3d effect */}
          <Paper elevation={5} className={classes.paper}>
            {/* spacing={3} means 8px * 3 = 24px */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={smValue}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-make'>Make</InputLabel>
                  <Field
                    name='make'
                    as={Select}
                    labelId='search-make'
                    label='Make'
                  >
                    <MenuItem value='all'>
                      <em>All Makes</em>
                    </MenuItem>
                    {makes.map(make => (
                      <MenuItem key={make.make} value={make.make}>
                        {`${make.make} (${make.count})`}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <ModelSelect make={values.make} name='model' models={models} />
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-min-price'>Min Price</InputLabel>
                  <Field
                    name='minPrice'
                    as={Select}
                    labelId='search-min-price'
                    label='Min Price'
                  >
                    <MenuItem value='all'>
                      <em>No Minimum</em>
                    </MenuItem>
                    {prices.map(price => (
                      <MenuItem key={price} value={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl variant='outlined' fullWidth>
                  <InputLabel id='search-max-price'>Max Price</InputLabel>
                  <Field
                    name='maxPrice'
                    as={Select}
                    labelId='search-max-price'
                    label='Max Price'
                  >
                    <MenuItem value='all'>
                      <em>No Maximum</em>
                    </MenuItem>
                    {prices.map(price => (
                      <MenuItem key={price} value={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  color='primary'
                >
                  Search Car
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Form>
      )}
    </Formik>
  );
}

interface ModelSelectProps extends SelectProps {
  name: string;
  models: Model[]; //models received from ServerSideProps
  make: string;
}

export function ModelSelect({ models, make, ...props }: ModelSelectProps) {
  const { setFieldValue } = useFormikContext();
  const [field] = useField({
    //create all the properties we need to pass to InputField
    name: props.name
  });
  const { data } = useSWR<Model[]>(`/api/models?make=${make}`, {
    //callback provided by SWR, tell us when the call is done. After selecting the make, models should be 'All Models' by default
    dedupingInterval: 60000, //if you did the call in the last minute to the same endpoint, don't do it again. After a minute you can do it again. Nếu các value của filter giống hệt thì click liên tục sẽ ko bị gọi api mới (trong vòng 1 phút). Nếu chọn Audi, xong chọn BMW, xong lại chọn Audi thì Audi cũng sẽ chỉ gọi 1 lần thôi.
    onSuccess: newValues => {
      if (!newValues.map(a => a.model).includes(field.value)) {
        //make this field.value = 'all', first, grab the formik context. every time we have a new call, and new values are different from the current value, ví dụ khi đổi make từ BMW sang Audi thì new values sẽ khác nhau
        setFieldValue("model", "all");
      }
    }
  }); //query model when we have 'make'
  const queriedModels = data || models; //nếu ko có data thì dùng models lấy từ serverside props

  return (
    <FormControl variant='outlined' fullWidth>
      <InputLabel id='search-model'>Model</InputLabel>
      {/* passing props and field to Select => connect Select and Formik done. This is the way to do custom field in formik */}
      <Select
        name='model'
        labelId='search-model'
        label='Model'
        {...props}
        {...field}
      >
        <MenuItem value='all'>
          <em>All Models</em>
        </MenuItem>
        {queriedModels.map(model => (
          <MenuItem key={model.model} value={model.model}>
            {`${model.model} (${model.count})`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const make = getAsString(ctx.query.make!);
  //dùng Promise thay vì get từng cái khi muốn get 2 cái cùng lúc chứ ko phải chờ cái nọ xong mới get cái kia
  const [makes, models] = await Promise.all([getMakes(), getModels(make)]);

  //const makes = await getMakes();
  //const models = await getModels(make); //get all the models when page first load
  return { props: { makes, models } };
};

/*
makes có dạng
[ { "make": "Audi", "count": 1 }, { "make": "BMW", "count": 3 }, { "make": "Ford", "count": 2 }, { "make": "Mazda", "count": 1 }, { "make": "Merces-Benz", "count": 2 }, { "make": "Peugeot", "count": 1 }, { "make": "Renault", "count": 3 }, { "make": "Seat", "count": 1 }, { "make": "Smart", "count": 4 }, { "make": "Volkswagen", "count": 3 } ]
 */
